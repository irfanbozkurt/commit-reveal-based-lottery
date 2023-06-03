import { AbiCoder, ethers, formatEther, keccak256, parseEther } from "ethers";
import React, { useEffect, useState } from "react";

import contractArtifact from "../contracts/Lottery.json";
import { TicketStatus, contractAddress } from "../contracts/constants.js";
import { Modal, Ticket } from "../components/index.js";

export const AppContext = React.createContext();

const { ethereum } = window;

const getLotteryContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractArtifact.abi, signer);
};

export const AppContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [currentAccount, setCurrentAccount] = useState("");

  const [tickets, setTickets] = useState(new Map());
  const [buyTicketLock, setBuyTicketLock] = useState(false);

  const [lotteryInPurchase, setLotteryInPurchase] = useState(0);

  const [inPurchaseTotalMoney, setInPurchaseTotalMoney] = useState(0);
  const [inPurchaseTicketCount, setInPurchaseTicketCount] = useState(0);

  const [inRevealTotalMoney, setInRevealTotalMoney] = useState(0);
  const [inRevealTicketCount, setInRevealTicketCount] = useState(0);

  const [startTimeOfContract, setStartTimeOfContract] = useState(0);
  const [balance, setBalance] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("test");
  const [modalBody, setModalBody] = useState("test test test test test test");
  const [closeButtonName, setCloseButtonName] = useState("close");

  // Functions
  const openModal = (title, body, closeButtonName = "close") => {
    setModalTitle(title);
    setModalBody(body);
    setCloseButtonName(closeButtonName);
    setModalOpen(true);
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) setCurrentAccount(accounts[0]);
      else console.log("No accounts found");
    } catch (error) {
      console.log(error);
    }
  };

  const populate = async () => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }
      const contract = await getLotteryContract();

      const lotteryInPurchase = parseInt(
        await contract.getCurrentLotteryInPurchase()
      );
      setLotteryInPurchase(lotteryInPurchase);

      await Promise.all([
        // User-specific
        (async () => {
          await getBalance();
        })(),
        (async () => {
          await fetchTickets();
        })(),
        // Lottery-specific
        (async () => {
          let iptm;
          try {
            iptm = formatEther(
              await contract.getTotalLotteryMoneyCollected(lotteryInPurchase)
            );
          } catch (e) {
            iptm = formatEther("0");
          }
          setInPurchaseTotalMoney(iptm);
        })(),
        (async () => {
          let irtm;
          if (lotteryInPurchase == 1) irtm = formatEther("0");
          else {
            try {
              irtm = formatEther(
                await contract.getTotalLotteryMoneyCollected(
                  lotteryInPurchase - 1
                )
              );
            } catch (e) {
              irtm = formatEther("0");
            }
          }
          setInRevealTotalMoney(irtm);
        })(),
        (async () => {
          let iptc;
          try {
            iptc = parseInt(
              await contract.getLastOwnedTicketNo(lotteryInPurchase)
            );
          } catch (e) {
            iptc = 0;
          }
          setInPurchaseTicketCount(iptc);
        })(),
        (async () => {
          let irtc;
          if (lotteryInPurchase == 1) irtc = 0;
          else {
            try {
              irtc = parseInt(
                await contract.getLastOwnedTicketNo(lotteryInPurchase - 1)
              );
            } catch (e) {
              irtc = 0;
            }
          }
          setInRevealTicketCount(irtc);
        })(),
        // Contract-specific
        (async () => {
          if (startTimeOfContract) return;
          const startTimeUnix = (
            await contract.startTimeOfContract()
          ).toString();
          setStartTimeOfContract(startTimeUnix);
        })(),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const buyTicket = async (type) => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }

      if (buyTicketLock) {
        console.warn(
          "You're buying another ticket and it hasn't been finalized yet. Wait for a modal to pop-up."
        );
        return;
      }

      const contract = await getLotteryContract();

      const rnd = Math.trunc(Math.random() * (Number.MAX_SAFE_INTEGER - 1));
      await contract.buyTicket(
        keccak256(
          new AbiCoder().encode(["uint256", "address"], [rnd, currentAccount])
        ),
        type
      );

      setBuyTicketLock(true);
      contract.once(contract.filters.TicketBought(currentAccount), (e) => {
        openModal(
          `You purchased one ${(() => {
            if (type == 1) return "full";
            if (type == 2) return "half";
            if (type == 3) return "quarter";
          })()} pass`,
          <>
            <p className="text-slate-500 text-lg leading-relaxed">
              <span className="text-red-500">
                Note down your random number right now!
              </span>
            </p>
            <p className="text-slate-500 text-lg leading-relaxed">
              You cannot claim prizes for this ticket without providing{" "}
              <span className="font-bold">lotery no</span>,{" "}
              <span className="font-bold">ticket no</span>, and{" "}
              <span className="font-bold">this number</span>. This information
              won't be stored automatically, so please note it down.
            </p>
            <div className="flex justify-center">
              <p className="my-4 text-slate-500 text-3xl font-bold leading-relaxed">
                {rnd}
              </p>
            </div>

            <div className="flex w-full justify-center">
              <Ticket
                data={{
                  ticketNo: parseInt(e.args[2]),
                  lotteryNo: parseInt(e.args[1]),
                  type: type,
                }}
              />
            </div>
          </>,
          "I kept the information"
        );
        setBuyTicketLock(false);
      });

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };
  const refundTicket = async (ticketNo) => {
    try {
      const contract = await getLotteryContract();
      await contract.collectTicketRefund(ticketNo);

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };
  const revealTicket = async (ticketNo, randomNumber) => {
    try {
      if (!randomNumber || randomNumber == 0) return;

      const contract = await getLotteryContract();
      await contract.revealRndNumber(ticketNo, randomNumber);

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };
  const collectPrize = async (lotteryNo, ticketNo) => {
    try {
      const contract = await getLotteryContract();
      await contract.collectTicketPrize(lotteryNo, ticketNo);

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchTickets = async () => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }

      const contract = await getLotteryContract();
      const lotteryInPurchase = parseInt(
        await contract.getCurrentLotteryInPurchase()
      );
      setLotteryInPurchase(lotteryInPurchase);

      const [
        allEvents,
        refundedEvents,
        revealedEvents,
        prizeCollectedEvents,
        lostEvents,
      ] = await Promise.all([
        (async () => {
          return await contract.queryFilter(
            contract.filters.TicketBought(currentAccount)
          );
        })(),
        (async () => {
          return await contract.queryFilter(
            contract.filters.TicketRefunded(currentAccount)
          );
        })(),
        (async () => {
          return await contract.queryFilter(
            contract.filters.TicketRevealed(currentAccount)
          );
        })(),
        (async () => {
          return await contract.queryFilter(
            contract.filters.PrizeCollected(currentAccount)
          );
        })(),
        (async () => {
          return await contract.queryFilter(
            contract.filters.TicketLost(currentAccount)
          );
        })(),
      ]);

      const refundedTickets = refundedEvents
        .map((event) => {
          return {
            lotteryNo: parseInt(event.args[1]),
            ticketNo: parseInt(event.args[2]),
          };
        })
        .reduce((acc, elem) => {
          acc.add(elem.lotteryNo + "_" + elem.ticketNo);
          return acc;
        }, new Set());

      const revealedTicketsList = [];
      const revealedTicketsMap = revealedEvents
        .map((event) => {
          return {
            lotteryNo: parseInt(event.args[1]),
            ticketNo: parseInt(event.args[2]),
            validReveal: event.args[5],
          };
        })
        .reduce((acc, elem) => {
          revealedTicketsList.push([elem.lotteryNo, elem.ticketNo]);
          acc.set(elem.lotteryNo + "_" + elem.ticketNo, elem.validReveal);
          return acc;
        }, new Map());

      const collectedTickets = prizeCollectedEvents
        .map((event) => {
          if (!event || event.length == 0) return {};
          return {
            lotteryNo: parseInt(event.args[1]),
            ticketNo: parseInt(event.args[2]),
            prize: parseEther(event.args[3].toString()),
          };
        })
        .reduce((acc, elem) => {
          acc.add(elem.lotteryNo + "_" + elem.ticketNo);
          return acc;
        }, new Set());

      const lostTickets = lostEvents
        .map((event) => {
          if (!event || event.length == 0) return {};
          return {
            lotteryNo: parseInt(event.args[1]),
            ticketNo: parseInt(event.args[2]),
          };
        })
        .reduce((acc, elem) => {
          acc.add(elem.lotteryNo + "_" + elem.ticketNo);
          return acc;
        }, new Set());

      // Check if any of the revealed tickets is a winner
      const winningTickets = (
        await Promise.all(
          revealedTicketsList.map(([lotteryNo, ticketNo]) =>
            contract.queryFilter(
              contract.filters.TicketWonLottery(lotteryNo, ticketNo)
            )
          )
        )
      )
        .map((event) => {
          if (!event || event.length == 0) return {};
          return {
            lotteryNo: parseInt(event[0].args[0]),
            ticketNo: parseInt(event[0].args[1]),
            place: parseInt(event[0].args[2]),
            type: parseInt(event[0].args[3]),
            prize: formatEther(event[0].args[4].toString()),
          };
        })
        .reduce((acc, elem) => {
          if (elem && elem.lotteryNo && elem.ticketNo)
            acc.set(elem.lotteryNo + "_" + elem.ticketNo, elem);
          return acc;
        }, new Map());

      setTickets(
        allEvents
          .map((event) => {
            return {
              lotteryNo: parseInt(event.args[1]),
              ticketNo: parseInt(event.args[2]),
              type: parseInt(event.args[3]),
              status: TicketStatus.Bought,
            };
          })
          .reduce((acc, ticket) => {
            let tick = Object.assign({}, ticket);
            const index = tick.lotteryNo + "_" + tick.ticketNo;

            if (refundedTickets.has(index)) tick.status = TicketStatus.Refunded;
            else if (revealedTicketsMap.has(index)) {
              if (revealedTicketsMap.get(index)) {
                tick.status = TicketStatus.Revealed;
                if (winningTickets.has(index)) {
                  tick.status = TicketStatus.Winner;
                  tick.place = winningTickets.get(index).place;
                  tick.prize = winningTickets.get(index).prize;
                  if (collectedTickets.has(index)) {
                    tick.status = TicketStatus.Collected;
                  }
                } else if (lostTickets.has(index))
                  tick.status = TicketStatus.Lost;
              } else tick.status = TicketStatus.InvalidReveal;
            } else if (tick.lotteryNo < lotteryInPurchase - 1)
              tick.status = TicketStatus.Forfeit;

            if (acc[tick.lotteryNo]) acc[tick.lotteryNo].push(tick);
            else acc[tick.lotteryNo] = [tick];
            return acc;
          }, {})
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getBalance = async () => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }
      const balance = formatEther(
        await (await getLotteryContract()).getBalance()
      );
      setBalance(balance);
    } catch (e) {
      console.error(e);
    }
  };
  const depositEther = async (amount) => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }
      const ether = parseEther(amount);
      await (await getLotteryContract()).depositEther(ether, { value: ether });

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };
  const withdrawEther = async (amount) => {
    try {
      if (!ethereum) {
        console.log("Ethereum is not present");
        return;
      }
      await (await getLotteryContract()).withdrawEther(parseEther(amount));

      setTimeout(async () => {
        await populate();
        setTimeout(async () => {
          await populate();
        }, 10000);
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    if (currentAccount) populate();
  }, [currentAccount]);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        startTimeOfContract,
        currentAccount,
        connectWallet: async () => {
          try {
            if (!ethereum) return alert("Please install MetaMask.");
            const accounts = await ethereum.request({
              method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
            window.location.reload();
          } catch (error) {
            throw new Error("No ethereum object", error.message);
          }
        },
        contractFuncs: {
          depositEther,
          withdrawEther,
          buyTicket,
          refundTicket,
          revealTicket,
          collectPrize,
          populate,
        },
        tickets,
        lotteryInPurchase,
        inPurchaseTotalMoney,
        inRevealTotalMoney,
        inPurchaseTicketCount,
        inRevealTicketCount,
        balance,
        openModal,
        setModalOpen,
      }}
    >
      <Modal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title={modalTitle}
        body={modalBody}
        closeButtonName={closeButtonName}
        populate={populate}
      />
      {children}
    </AppContext.Provider>
  );
};
