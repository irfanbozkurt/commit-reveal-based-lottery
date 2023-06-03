const { ethers } = require("hardhat");
const { expect } = require("chai");
const { executeAndPrintEvents, moveTime, buyTicket } = require("./helpers");

describe("base monatery functionality", () => {
  let contract, allSigners;

  beforeEach(async () => {
    contract = await (await ethers.getContractFactory("Lottery")).deploy();
    allSigners = await ethers.getSigners();
  });

  it("depositEther", async () => {
    const depositAmount = ethers.utils.parseEther("1");
    await contract.depositEther(depositAmount, { value: depositAmount });

    expect(
      (await ethers.provider.getBalance(contract.address)).toString()
    ).to.equal(depositAmount.toString());
  });

  it("withdrawEther", async () => {
    const depositAmount = ethers.utils.parseEther("1");
    const withdrawAmount = ethers.utils.parseEther("0.5");

    await contract.depositEther(depositAmount, { value: depositAmount });
    await contract.withdrawEther(withdrawAmount);

    const contractBalance = await ethers.provider.getBalance(contract.address);
    expect(contractBalance.toString()).to.equal(
      depositAmount.sub(withdrawAmount).toString()
    );
  });

  it("getBalance", async () => {
    const depositAmount = ethers.utils.parseEther("1");
    const withdrawAmount = ethers.utils.parseEther("0.5");

    await contract.depositEther(depositAmount, { value: depositAmount });
    await contract.withdrawEther(withdrawAmount);

    const balance = await contract.getBalance();
    expect(balance.toString()).to.equal(
      depositAmount.sub(withdrawAmount).toString()
    );
  });
});

describe("time arithmetics", () => {
  let contract, allSigners;

  beforeEach(async () => {
    contract = await (await ethers.getContractFactory("Lottery")).deploy();
    allSigners = await ethers.getSigners();
  });

  it("getCurrentLotteryInPurchase", async () => {
    for (let i = 1; i <= 10; i++) {
      expect(await contract.getCurrentLotteryInPurchase()).to.equal(i);
      await moveTime(ethers.provider, 7 * 24 * 60 * 61);
    }
  });

  it("getCurrentLotteryInReveal", async () => {
    for (let i = 1; i <= 10; i++) {
      expect(await contract.getCurrentLotteryInReveal()).to.equal(i - 1);
      await moveTime(ethers.provider, 7 * 24 * 60 * 61);
    }
  });
});

describe("state variables", () => {
  let contract, allSigners;

  beforeEach(async () => {
    contract = await (await ethers.getContractFactory("Lottery")).deploy();
    allSigners = await ethers.getSigners();
  });

  it("getTotalLotteryMoneyCollected", async () => {
    expect(
      (await contract.getTotalLotteryMoneyCollected(0)).toString()
    ).to.be.equal("0");
    expect(
      (await contract.getTotalLotteryMoneyCollected(1)).toString()
    ).to.be.equal("0");
    expect(
      (await contract.getTotalLotteryMoneyCollected(1)).toString()
    ).to.be.equal("0");

    const ticketType = 1; // Full ticket
    await buyTicket(
      contract,
      allSigners[0],
      ethers.utils.formatBytes32String("random_hash"),
      ticketType
    );

    const ticketId = 1;
    await contract.collectTicketRefund(ticketId);

    expect(
      (await contract.getTotalLotteryMoneyCollected(1)).toString()
    ).to.be.equal("0");
  });

  it("getTicketPrice", async () => {
    expect((await contract.getTicketPrice(1)).toString()).to.be.equal(
      "8000000000000000"
    );
    expect((await contract.getTicketPrice(2)).toString()).to.be.equal(
      "4000000000000000"
    );
    expect((await contract.getTicketPrice(3)).toString()).to.be.equal(
      "2000000000000000"
    );
  });

  it("getLastOwnedTicketNo", async () => {
    await expect(contract.getLastOwnedTicketNo(0)).to.be.revertedWith(
      "Lottery round does not exist"
    );

    const ticketType = 1; // Full ticket
    await buyTicket(
      contract,
      allSigners[0],
      ethers.utils.formatBytes32String("random_hash"),
      ticketType
    );

    expect(
      parseInt((await contract.getLastOwnedTicketNo(1)).toString())
    ).to.be.equal(1);

    const ticketType2 = 2; // Full ticket
    await buyTicket(
      contract,
      allSigners[1],
      ethers.utils.formatBytes32String("random_hash"),
      ticketType2
    );

    expect(
      parseInt((await contract.getLastOwnedTicketNo(1)).toString())
    ).to.be.equal(2);

    await expect(contract.getLastOwnedTicketNo(2)).to.be.revertedWith(
      "Lottery round does not exist"
    );
  });

  it("getIthWinningTicket", async () => {
    const contract = await (
      await ethers.getContractFactory("Lottery")
    ).deploy();
    const allSigners = await ethers.getSigners();

    await expect(
      contract.callStatic.getIthWinningTicket(1, 0)
    ).to.be.revertedWith("Prizes are determined after the reveal stage ends.");
    await expect(
      contract.callStatic.getIthWinningTicket(4, 1)
    ).to.be.revertedWith("Prizes are determined after the reveal stage ends.");

    const ticketType = 1; // Full ticket
    const rnd1 = Math.trunc(Math.random() * 1000000);
    await buyTicket(contract, allSigners[0], rnd1, ticketType);
    const rnd2 = Math.trunc(Math.random() * 1000000);
    await buyTicket(contract, allSigners[1], rnd2, ticketType);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);
    // Do reveal
    await contract.connect(allSigners[0]).revealRndNumber(1, rnd1);
    await contract.connect(allSigners[1]).revealRndNumber(2, rnd2);
    //End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    await expect(
      contract.callStatic.getIthWinningTicket(0, 1)
    ).to.be.revertedWith("Invalid winning ticket index");

    // Collect prizes
    await contract.connect(allSigners[0]).collectTicketPrize(1, 1);
    await contract.connect(allSigners[1]).collectTicketPrize(1, 2);

    const [firstTicketId, firstPrize] =
      await contract.callStatic.getIthWinningTicket(1, 1);
    const [secondTicketId, secondPrize] =
      await contract.callStatic.getIthWinningTicket(2, 1);

    expect(
      (
        await contract.connect(allSigners[firstTicketId - 1]).getBalance()
      ).toString()
    ).to.be.equal(firstPrize.toString());
    expect(
      (
        await contract.connect(allSigners[secondTicketId - 1]).getBalance()
      ).toString()
    ).to.be.equal(secondPrize.toString());

    await expect(contract.getIthWinningTicket(3, 1)).to.be.revertedWith(
      "No data found for given lottery and place."
    );
  });

  it("getIthOwnedTicketNo", async () => {
    const contract = await (
      await ethers.getContractFactory("Lottery")
    ).deploy();
    const allSigners = await ethers.getSigners();

    await expect(
      contract.callStatic.getIthOwnedTicketNo(1, 0)
    ).to.be.revertedWith("Lottery round does not exist");
    await expect(
      contract.callStatic.getIthOwnedTicketNo(0, 1)
    ).to.be.revertedWith("Invalid ticket index");

    const ticketType1 = 1; // Full ticket
    const rnd1 = Math.trunc(Math.random() * 1000000);
    await buyTicket(contract, allSigners[0], rnd1, ticketType1);
    const ticketType2 = 2; // Half ticket
    const rnd2 = Math.trunc(Math.random() * 10000000000);
    await buyTicket(contract, allSigners[1], rnd2, ticketType2);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);
    // Do reveal
    await contract.revealRndNumber(1, rnd1);
    await contract.connect(allSigners[1]).revealRndNumber(2, rnd2);
    // End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Collect one prize only
    await contract.collectTicketPrize(1, 1);

    const [, status1] = await contract.callStatic.getIthOwnedTicketNo(1, 1);
    const [, status2] = await contract.callStatic.getIthOwnedTicketNo(2, 1);

    expect(status1.toString()).to.be.equal("2");
    expect(status2.toString()).to.be.equal("1");
  });

  it("getLotteryNos", async () => {
    for (let i = 1; i <= 10; i++) {
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const timestamp = (await ethers.provider.getBlock(blockNumBefore))
        .timestamp;

      const [inPurchase, inReveal] = await contract.getLotteryNos(
        parseInt(timestamp.toString()) + 20
      );
      expect(inPurchase.toString()).to.be.equal(`${i}`);
      expect(inReveal.toString()).to.be.equal(`${i - 1}`);
      await moveTime(ethers.provider, 7 * 24 * 60 * 61);
    }
  });
});

describe("business logic", () => {
  let contract, allSigners;

  beforeEach(async () => {
    contract = await (await ethers.getContractFactory("Lottery")).deploy();
    allSigners = await ethers.getSigners();
  });

  describe("buyTicket", () => {
    it("success", async () => {
      const contractBalance1 = await ethers.provider.getBalance(
        contract.address
      );

      const ticketType = 1;

      const ticketPrice = await buyTicket(
        contract,
        allSigners[0],
        ethers.utils.formatBytes32String("random_hash"),
        ticketType
      );
      await buyTicket(
        contract,
        allSigners[0],
        ethers.utils.formatBytes32String("random_hash"),
        ticketType
      );

      const contractBalance2 = await ethers.provider.getBalance(
        contract.address
      );

      expect(contractBalance2.toString()).to.equal(
        contractBalance1.add(ticketPrice.mul(2)).toString()
      );
    });

    it("failure", async () => {
      await expect(
        contract.buyTicket(ethers.utils.formatBytes32String("random_hash"), 0)
      ).to.be.revertedWith("Invalid ticket type");
      await expect(
        contract.buyTicket(ethers.utils.formatBytes32String("random_hash"), 4)
      ).to.be.revertedWith("Invalid ticket type");

      const ticketType = 1; // Full ticket
      await expect(
        contract.buyTicket(
          ethers.utils.formatBytes32String("random_hash"),
          ticketType
        )
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("collectTicketRefund", () => {
    it("success", async () => {
      const ticketType = 1; // Full ticket
      const ticketPrice = await buyTicket(
        contract,
        allSigners[0],
        ethers.utils.formatBytes32String("random_hash"),
        ticketType
      );

      const ticketId = 1;
      await contract.collectTicketRefund(ticketId);

      const lastBalance = await contract.getBalance();
      expect(lastBalance.toString()).to.be.equal(ticketPrice.toString());
    });

    it("failure", async () => {
      const ticketId = 1;
      await expect(contract.collectTicketRefund(ticketId)).to.be.revertedWith(
        "User doesn't have an unrevealed ticket for lottery in purchase"
      );

      const ticketType = 1; // Full ticket
      await buyTicket(
        contract,
        allSigners[0],
        ethers.utils.formatBytes32String("random_hash"),
        ticketType
      );

      // Skip the purchase stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await expect(contract.collectTicketRefund(ticketId)).to.be.revertedWith(
        "User doesn't have an unrevealed ticket for lottery in purchase"
      );

      const lastBalance = await contract.getBalance();
      expect(lastBalance.toString()).to.be.equal("0");
    });
  });

  describe("revealRndNumber", () => {
    it("success", async () => {
      const rnd = Math.trunc(Math.random() * 1000000000000);
      const ticketType = 1;
      await buyTicket(contract, allSigners[0], rnd, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      const ticketId = 1;
      await contract.revealRndNumber(ticketId, rnd);
      // Reveal success, no chance of failure from now on.
      // Because we perform on-chain hash verification already.
    });

    it("failure", async () => {
      const ticketId = 1;
      await expect(contract.revealRndNumber(ticketId, 3)).to.be.revertedWith(
        "Reveal stage is not active"
      );

      const rnd = Math.trunc(Math.random() * 1000000000000);
      const ticketType = 1;
      await buyTicket(contract, allSigners[1], rnd, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await expect(contract.revealRndNumber(ticketId, 3)).to.be.revertedWith(
        "User doesn't have an unrevealed ticket for lottery in purchase"
      );
      await contract.connect(allSigners[1]).revealRndNumber(1, rnd - 1);

      await expect(
        contract.connect(allSigners[1]).revealRndNumber(1, rnd)
      ).to.be.revertedWith(
        "Ticket is forfeit. User attempted reveal and could not provide the same random number."
      );
    });
  });

  describe("checkIfTicketWon", () => {
    it("success", async () => {
      const rnd = Math.trunc(Math.random() * 1000000000000);
      const ticketType = 1;
      const ticketPrice = await buyTicket(
        contract,
        allSigners[0],
        rnd,
        ticketType
      );

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      const ticketId = 1;
      await contract.revealRndNumber(ticketId, rnd);

      // End the reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      expect(
        (await contract.callStatic.checkIfTicketWon(1, 1)).toString()
      ).to.be.equal(ticketPrice.div(2).toString());
    });

    it("failure", async () => {
      await expect(contract.checkIfTicketWon(1, 1)).to.be.revertedWith(
        "Prizes are determined after the reveal stage ends."
      );
    });
  });

  describe("collectTicketPrize", () => {
    it("success with one entry", async () => {
      const rnd = Math.trunc(Math.random() * 1000000000000);
      const ticketType = 1;
      const price = await buyTicket(contract, allSigners[0], rnd, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);
      // Reveal
      const ticketId = 1;
      await contract.revealRndNumber(ticketId, rnd);
      // End the reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await contract.collectTicketPrize(1, 1);

      expect(price.toString()).to.be.equal(
        (await contract.getBalance()).mul(2).toString()
      );
    });

    it("success with two entries", async () => {
      const rnd1 = Math.trunc(Math.random() * 1000000);
      const ticketType = 1; // Full ticket
      await buyTicket(contract, allSigners[0], rnd1, ticketType);

      const rnd2 = Math.trunc(Math.random() * 1000000);
      await buyTicket(contract, allSigners[1], rnd2, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await contract.revealRndNumber(1, rnd1);
      await contract.connect(allSigners[1]).revealRndNumber(2, rnd2);

      // End the reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      const totalMoneyCollected = await contract.getTotalLotteryMoneyCollected(
        1
      );

      await contract.connect(allSigners[0]).collectTicketPrize(1, 1);
      await contract.connect(allSigners[1]).collectTicketPrize(1, 2);

      const yieldedAmounts = (
        await contract.callStatic.getYieldedAmounts(1)
      ).map((a) => a.toString());

      expect(yieldedAmounts).to.include(totalMoneyCollected.div(2).toString());
      expect(yieldedAmounts).to.include(totalMoneyCollected.div(4).toString());
    });

    it("success with three entries", async () => {
      const ticketType = 1; // Full ticket

      const rnd1 = Math.trunc(Math.random() * 1000000);
      await buyTicket(contract, allSigners[0], rnd1, ticketType);
      const rnd2 = Math.trunc(Math.random() * 1000000);
      await buyTicket(contract, allSigners[1], rnd2, ticketType);
      const rnd3 = Math.trunc(Math.random() * 1000000);
      await buyTicket(contract, allSigners[2], rnd3, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await contract.revealRndNumber(1, rnd1);
      await contract.connect(allSigners[1]).revealRndNumber(2, rnd2);
      await contract.connect(allSigners[2]).revealRndNumber(3, rnd3);

      const totalMoneyCollected = await contract.getTotalLotteryMoneyCollected(
        1
      );

      // End the reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await contract.connect(allSigners[0]).collectTicketPrize(1, 1);
      await contract.connect(allSigners[1]).collectTicketPrize(1, 2);
      await contract.connect(allSigners[2]).collectTicketPrize(1, 3);

      const yieldedAmounts = (
        await contract.callStatic.getYieldedAmounts(1)
      ).map((a) => a.toString());

      expect(yieldedAmounts).to.include(totalMoneyCollected.div(2).toString());
      expect(yieldedAmounts).to.include(totalMoneyCollected.div(4).toString());
      expect(yieldedAmounts).to.include(totalMoneyCollected.div(8).toString());
    });

    it("failure", async () => {
      const ticketType = 1; // Full ticket
      const rnd = Math.trunc(Math.random() * 1000000000000);
      await buyTicket(contract, allSigners[0], rnd, ticketType);

      // Move to reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      const ticketId = 1;
      await contract.revealRndNumber(ticketId, rnd);

      await expect(contract.collectTicketPrize(1, 1)).to.be.revertedWith(
        "Prizes are determined after the reveal stage ends."
      );

      // End the reveal stage
      await moveTime(ethers.provider, 8 * 24 * 60 * 60);

      await expect(contract.collectTicketPrize(1, 2)).to.be.revertedWith(
        "Caller is not the ticket owner"
      );
    });
  });
});

describe("mass usage", () => {
  let contract, allSigners;

  beforeEach(async () => {
    contract = await (await ethers.getContractFactory("Lottery")).deploy();
    allSigners = await ethers.getSigners();
  });

  it("5 tickets", async () => {
    const rands = [];
    let promiseList = [];
    for (let i = 0; i < 5; i++) {
      rands.push(Math.trunc(Math.random() * 100000000000));
      promiseList.push(
        buyTicket(contract, allSigners[i], rands[i], (rands[i] % 3) + 1)
      );
    }
    await Promise.all(promiseList);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Reveal Numbers
    promiseList = [];
    for (let i = 0; i < 5; i++)
      promiseList.push(
        contract.connect(allSigners[i]).revealRndNumber(i + 1, rands[i])
      );
    await Promise.all(promiseList);

    // End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Get winning tickets
    const winners = (
      await Promise.all(
        [1, 2, 3].map((num) => contract.callStatic.getIthWinningTicket(num, 1))
      )
    ).map(([id, prize]) => [parseInt(id), prize.toString()]);

    // Collect prizes
    for (let i = 0; i < 3; i++) {
      await contract
        .connect(allSigners[winners[i][0] - 1])
        .collectTicketPrize(1, winners[i][0]);

      expect(
        (
          await contract.connect(allSigners[winners[i][0] - 1]).getBalance()
        ).toString()
      ).to.be.equal(winners[i][1]);
    }
  });

  it("10 tickets", async () => {
    const rands = [];
    let promiseList = [];
    for (let i = 0; i < 10; i++) {
      rands.push(Math.trunc(Math.random() * 100000000000));
      promiseList.push(
        buyTicket(contract, allSigners[i], rands[i], (rands[i] % 3) + 1)
      );
    }
    await Promise.all(promiseList);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Reveal Numbers
    promiseList = [];
    for (let i = 0; i < 10; i++)
      promiseList.push(
        contract.connect(allSigners[i]).revealRndNumber(i + 1, rands[i])
      );
    await Promise.all(promiseList);

    // End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Get winning tickets
    const winners = (
      await Promise.all(
        [1, 2, 3].map((num) => contract.callStatic.getIthWinningTicket(num, 1))
      )
    ).map(([id, prize]) => [parseInt(id), prize.toString()]);

    // Collect prizes
    for (let i = 0; i < 3; i++) {
      await contract
        .connect(allSigners[winners[i][0] - 1])
        .collectTicketPrize(1, winners[i][0]);

      expect(
        (
          await contract.connect(allSigners[winners[i][0] - 1]).getBalance()
        ).toString()
      ).to.be.equal(winners[i][1]);
    }
  });

  it("100 tickets", async () => {
    const rands = [];
    let promiseList = [];
    for (let i = 0; i < 100; i++) {
      rands.push(Math.trunc(Math.random() * 100000000000));
      promiseList.push(
        buyTicket(contract, allSigners[i], rands[i], (rands[i] % 3) + 1)
      );
    }
    await Promise.all(promiseList);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Reveal Numbers
    promiseList = [];
    for (let i = 0; i < 100; i++)
      promiseList.push(
        contract.connect(allSigners[i]).revealRndNumber(i + 1, rands[i])
      );
    await Promise.all(promiseList);

    // End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Get winning tickets
    const winners = (
      await Promise.all(
        [1, 2, 3].map((num) => contract.callStatic.getIthWinningTicket(num, 1))
      )
    ).map(([id, prize]) => [parseInt(id), prize.toString()]);

    // Collect prizes
    for (let i = 0; i < 3; i++) {
      await contract
        .connect(allSigners[winners[i][0] - 1])
        .collectTicketPrize(1, winners[i][0]);

      expect(
        (
          await contract.connect(allSigners[winners[i][0] - 1]).getBalance()
        ).toString()
      ).to.be.equal(winners[i][1]);
    }
  });

  it("200 tickets", async () => {
    const rands = [];
    let promiseList = [];
    for (let i = 0; i < 200; i++) {
      rands.push(Math.trunc(Math.random() * 100000000000));
      promiseList.push(
        buyTicket(contract, allSigners[i], rands[i], (rands[i] % 3) + 1)
      );
    }
    await Promise.all(promiseList);

    // Move to reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Reveal Numbers
    promiseList = [];
    for (let i = 0; i < 200; i++)
      promiseList.push(
        contract.connect(allSigners[i]).revealRndNumber(i + 1, rands[i])
      );
    await Promise.all(promiseList);

    // End the reveal stage
    await moveTime(ethers.provider, 8 * 24 * 60 * 60);

    // Get winning tickets
    const winners = (
      await Promise.all(
        [1, 2, 3].map((num) => contract.callStatic.getIthWinningTicket(num, 1))
      )
    ).map(([id, prize]) => [parseInt(id), prize.toString()]);

    // Collect prizes and assert balance
    for (let i = 0; i < 3; i++) {
      await contract
        .connect(allSigners[winners[i][0] - 1])
        .collectTicketPrize(1, winners[i][0]);

      expect(
        (
          await contract.connect(allSigners[winners[i][0] - 1]).getBalance()
        ).toString()
      ).to.be.equal(winners[i][1]);
    }
  });
});
