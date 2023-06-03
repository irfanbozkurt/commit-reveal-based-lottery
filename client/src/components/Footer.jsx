import logo from "../../images/logo.png";

export const Footer = () => (
  <div className="w-full flex items-center flex-col gradient-bg-footer">
    <div className="w-full flex justify-start">
      <div className="flex justify-start items-center pl-10">
        <img src={logo} alt="logo" className="w-24" />
      </div>
      <div className="flex flex-col justify-end w-full text-left pb-5">
        <p className="text-white text-sm font-medium mt-2">info@01labs.io</p>
        <p className="text-white text-sm ">
          Earn your prize without any paperwork now.
        </p>
      </div>
    </div>

    <div className="w-[99%] h-[0.25px] bg-gray-400" />

    <div className="sm:w-[90%] w-full flex justify-between items-center my-1">
      <p className="text-white text-left text-xs">All rights reserved</p>
    </div>
  </div>
);
