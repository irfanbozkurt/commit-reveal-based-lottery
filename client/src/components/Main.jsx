import React, { useContext } from "react";

import { AiFillPlayCircle } from "react-icons/ai";
import { shortenAddress } from "../utils/index.js";

import { AppContext } from "../context/AppContext.jsx";
import { MonateryInteractions } from "./index.js";

import { formatEther, parseEther } from "ethers";
import { Tickets } from "./index.js";

export const Main = () => {
  const { connectWallet, currentAccount, balance, contractFuncs } =
    useContext(AppContext);

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {!currentAccount && (
        <div className="flex mf:flex-row flex-col items-start pb-12 px-4">
          <div className="items-start mf:mr-10">
            <p className="text-left mt-5 text-white font-light md:w-12/12 w-11/16 text-base">
              Take your chance to win weekly prizes in one click, without
              trusting third party organizations
            </p>
            <button
              type="button"
              onClick={connectWallet}
              className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
            >
              <AiFillPlayCircle className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Connect Wallet
              </p>
            </button>
          </div>
        </div>
      )}

      {currentAccount && (
        <>
          <div className="flex flex-col w-full justify-center items-center pb-10">
            <div className="flex flex-row w-5/6 justify-center items-center pb-10 px-12">
              <div className="w-1/2 flex flex-col flex-2 items-center justify-start mf:mt-0 mt-10">
                <div className="border-2 border-green-500 p-3 flex justify-end items-start flex-col rounded-xl h-15 sm:w-72 w-full mt-2 eth-card .white-glassmorphism">
                  <div className="flex justify-between flex-row w-full items-start">
                    <p className="text-black font-semibold text-lg">
                      Connected
                    </p>
                    <p className="text-black font-semibold text-lg px-2">
                      {shortenAddress(currentAccount)}
                    </p>
                  </div>
                </div>

                <div className="border-2 border-green-500 p-3 flex justify-end items-start flex-col rounded-xl h-15 sm:w-72 w-full my-2 eth-card .white-glassmorphism ">
                  <div className="flex justify-between flex-row w-full items-start">
                    <p className="text-black font-semibold text-lg">Balance</p>
                    <p className="text-black font-semibold text-lg px-2">
                      {balance} Ether
                    </p>
                  </div>
                </div>
              </div>

              <MonateryInteractions classNames="w-1/2 p-2 h-13 flex flex-row items-center justify-center blue-glassmorphism" />
            </div>

            <div className="flex flex-row space-x-4 justify-center w-3/4 pb-3 ">
              {balance >= 0.008 ? (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    await contractFuncs.buyTicket(1);
                  }}
                  className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-green-200 text-lg`}>
                    Enter Full for {0.008} Ether
                  </p>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`:disabled bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-red-200 text-lg`}>
                    Deposit{" "}
                    {formatEther(
                      parseEther("0.008") - parseEther(balance || "0")
                    ).toString()}{" "}
                    for Full
                  </p>
                </button>
              )}

              {balance >= 0.004 ? (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    await contractFuncs.buyTicket(2);
                  }}
                  className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-green-200 text-lg`}>
                    Enter Half for {0.004} Ether
                  </p>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-red-200 text-lg`}>
                    Deposit{" "}
                    {formatEther(
                      parseEther("0.004") - parseEther(balance || "0")
                    ).toString()}{" "}
                    for Half
                  </p>
                </button>
              )}

              {balance >= 0.002 ? (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    await contractFuncs.buyTicket(3);
                  }}
                  className={`bg-transparent hover:bg-green-900 font-bold border-2 border-green-400 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-green-200 text-lg`}>
                    Enter Quarter for {0.002} Ether
                  </p>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`bg-transparent hover:bg-red-900 font-bold border-2 border-red-200 p-3 flex-auto rounded-xl h-15`}
                >
                  <p className={`text-red-200 text-lg`}>
                    Deposit{" "}
                    {formatEther(
                      parseEther("0.002") - parseEther(balance || "0")
                    ).toString()}{" "}
                    for Quarter
                  </p>
                </button>
              )}
            </div>
          </div>

          <Tickets />
        </>
      )}
    </div>
  );
};
