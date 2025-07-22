import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState, useRef, useLayoutEffect } from "react";

const ShadDropdown = ({ items = [], value, onChange, placeholder = "All Categories" }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [menuWidth, setMenuWidth] = useState(160);

  useLayoutEffect(() => {
    if (triggerRef.current) {
      setMenuWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <div className="relative z-50">
      {open && (
        <div
          className="fixed inset-0 bg-transparent"
          style={{ backdropFilter: "blur(1px)", zIndex: 40 }} // reduced blur to minimum
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            ref={triggerRef}
            className="px-4 py-2 rounded border bg-white text-gray-700 min-w-[160px] text-left flex items-center justify-between font-medium text-sm"
            type="button"
            style={{ width: `${menuWidth}px` }}
          >
            <span>{value || placeholder}</span>
            <svg
              className="transition-transform duration-200 ml-2"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              {open ? (
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="bg-white rounded shadow py-1 font-medium text-sm text-gray-700"
          side="bottom"
          sideOffset={5}
          style={{ minWidth: `${menuWidth}px`, width: `${menuWidth}px`, zIndex: 60 }}
        >
          <DropdownMenu.Item
            className="px-4 py-2 cursor-pointer hover:bg-blue-700 hover:text-white"
            onSelect={() => onChange({ target: { value: "" } })}
          >
            {placeholder}
          </DropdownMenu.Item>
          {items.map((item) => (
            <DropdownMenu.Item
              key={item}
              className="px-4 py-2 cursor-pointer hover:bg-blue-700 hover:text-white"
              onSelect={() => onChange({ target: { value: item } })}
            >
              {item}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default ShadDropdown;