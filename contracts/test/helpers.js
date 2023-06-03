const { ethers } = require("hardhat");

const executeAndPrintEvents = async (tx, args) =>
  console.log(
    (await (await tx(...args)).wait(1)).events
      .map((event) => event.data)
      .map((data) => Buffer.from(data.substring(2), "hex").toString())
  );

const moveTime = async (provider, seconds) => {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine");
};

const buyTicket = async (contract, signer, rnd, ticketType = 1) => {
  const price = await contract.getTicketPrice(ticketType);
  await contract.connect(signer).depositEther(price, { value: price });
  await contract
    .connect(signer)
    .buyTicket(
      ethers.utils.keccak256(
        new ethers.utils.AbiCoder().encode(
          ["uint256", "address"],
          [rnd, signer.address]
        )
      ),
      ticketType
    );
  return price;
};

module.exports = { executeAndPrintEvents, moveTime, buyTicket };
