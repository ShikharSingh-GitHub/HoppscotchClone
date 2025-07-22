import Tippy from "@tippyjs/react";
import { forwardRef } from "react";

const IconButton = forwardRef(
  (
    {
      children,
      direction = "right",
      name,
      height,
      onClick,
      className = "",
      as: Component = "button",
      ...props
    },
    ref
  ) => {
    return (
      <Tippy
        content={<span className="text-[10px] font-semibold">{name}</span>}
        placement={direction}
        theme="light">
        <Component
          ref={ref}
          onClick={onClick}
          className={`${height && height} ${
            className ? className : "text-gray-400 hover:text-white"
          }`}
          {...props}>
          {children}
        </Component>
      </Tippy>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
