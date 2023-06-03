import React, { useContext } from "react";

import logo from "../../images/logo.png";
import { AppContext } from "../context/AppContext";
import { useCountdown } from "../hooks/index.js";

const tableCellStyle =
  "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 font-semibold text-white";

const NavBarItem = ({ title, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>
);

const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  if (days + hours + minutes + seconds <= 0) return;

  console.log(days);
  return (
    <div className="flex flex-row justify-center items-center text-white font-semibold text-lg">
      <div className="flex flex-row p-2">
        <p>{days}</p>
        <span>d</span>
      </div>
      <div>{":"}</div>
      <div className="flex flex-row p-2">
        <p>{hours}</p>
        <span>h</span>
      </div>
      <div>{":"}</div>
      <div className="flex flex-row p-2">
        <p>{minutes}</p>
        <span>m</span>
      </div>
    </div>
  );
};

const ONE_WEEK = 7 * 24 * 60 * 60;

export const Navbar = () => {
  const {
    currentAccount,
    contractFuncs,
    startTimeOfContract,
    lotteryInPurchase,
    inPurchaseTotalMoney,
    inPurchaseTicketCount,
    inRevealTotalMoney,
    inRevealTicketCount,
  } = useContext(AppContext);

  return (
    <div className="w-full flex md:justify-start justify-between items-center px-5">
      <img
        onClick={async () => {
          await contractFuncs.populate();
        }}
        src={logo}
        alt="logo"
        className="mb-3"
      />

      {!currentAccount && (
        <div className="md:p-20 py-12 px-4">
          <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
            <h1 className="text-4xl text-white text-gradient py-1">
              Transparent, simple, decentralized
            </h1>
          </div>
        </div>
      )}

      {currentAccount && (
        <div className="w-full">
          <div className="table-row">
            <div className="table-cell text-white font-semibold text-lg px-5">
              Lottery In Purchase
            </div>

            <div className={`table-cell rounded-tl-2xl ${tableCellStyle}`}>
              {lotteryInPurchase}
            </div>
            <div className={`table-cell ${tableCellStyle}`}>
              {startTimeOfContract && (
                <CountdownTimer
                  targetDate={(parseInt(startTimeOfContract) + ONE_WEEK * lotteryInPurchase) * 1000}
                />
              )}
            </div>
            <div className={`table-cell ${tableCellStyle} w-48`}>
              {inPurchaseTicketCount} Tickets Sold
            </div>
            <div
              className={`table-cell sm:rounded-tr-2xl ${tableCellStyle} w-64`}
            >
              {inPurchaseTotalMoney} Ethers Staked
            </div>
          </div>

          <div className="table-row w-full">
            <div className="table-cell text-white font-semibold text-lg px-5">
              Lottery In Reveal
            </div>
            <div className={`table-cell sm:rounded-bl-2xl ${tableCellStyle}`}>
              {parseInt(lotteryInPurchase) - 1}
            </div>
            <div className={`table-cell${tableCellStyle}`}>
              {startTimeOfContract && (
                <CountdownTimer
                  targetDate={(parseInt(startTimeOfContract) + ONE_WEEK * lotteryInPurchase) * 1000}
                />
              )}
            </div>
            <div className={`table-cell ${tableCellStyle} w-48`}>
              {inRevealTicketCount} Tickets Sold
            </div>
            <div
              className={`table-cell sm:rounded-br-2xl ${tableCellStyle} w-48`}
            >
              {inRevealTotalMoney} Ethers Staked
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
