import React, { useContext, useState } from "react";

import { Loader } from "../components/index.js";
import { Input } from "./index.js";
import { AppContext } from "../context/AppContext.jsx";

export const MonateryInteractions = ({ classNames }) => {
  const { contractFuncs } = useContext(AppContext);

  const [depositLoading, setDepositLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0.0);

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0.0);

  return (
    <div className={`${classNames}`}>
      <div className="flex flex-col p-1 items-center">
        <Input
          placeholder="Amount (ETH)"
          name="amount"
          type="number"
          value={depositAmount}
          handleChange={(e) => setDepositAmount(e.target.value)}
          className={"ml-1 mr-2"}
        />

        {depositLoading ? (
          <Loader />
        ) : (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              setDepositLoading(true);
              await contractFuncs.depositEther(depositAmount);
              setDepositLoading(false);
              setDepositAmount(0);
            }}
            className="text-white w-11/12 border-[1px] p-1 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
          >
            Deposit Ether
          </button>
        )}
      </div>

      <div className="flex flex-col p-1 items-center">
        <Input
          placeholder="Amount (ETH)"
          name="amount"
          type="number"
          value={withdrawAmount}
          className={"ml-1 mr-2"}
          handleChange={(e) => setWithdrawAmount(e.target.value)}
        />

        {withdrawLoading ? (
          <Loader />
        ) : (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              setWithdrawLoading(true);
              await contractFuncs.withdrawEther(withdrawAmount);
              setWithdrawLoading(false);
              setWithdrawAmount(0);
            }}
            className="text-white w-11/12 border-[1px] p-1 border-[#3d4f7c] hover:bg-[#3d4f7c] rounded-full cursor-pointer"
          >
            Withdraw Ether
          </button>
        )}
      </div>
    </div>
  );
};
