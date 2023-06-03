import React from "react";

export const Modal = ({
  modalOpen,
  setModalOpen,
  title,
  body,
  closeButtonName,
  populate,
}) => {
  if (!modalOpen) return null;

  const closeModal = () => {
    populate();
    setModalOpen(false);
  };

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-xl">
          {/*content*/}
          <div
            style={{ minWidth: "36vw" }}
            className="w-full border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
          >
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="pt-2 text-3xl font-semibold">{title}</h3>
              <button
                className="mt-2 mr-4 rounded-3xl bg-pink-500 bg-opacity-70 p-3 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                onClick={closeModal}
                data-ripple-light="true"
              >
                <i className="material-icons">{closeButtonName}</i>
              </button>
            </div>
            {/*body*/}
            <div className="relative p-6 flex-auto">{body}</div>
          </div>
        </div>
      </div>
      <div
        onClick={closeModal}
        className="opacity-50 fixed inset-0 z-40 bg-black"
      ></div>
    </>
  );
};
