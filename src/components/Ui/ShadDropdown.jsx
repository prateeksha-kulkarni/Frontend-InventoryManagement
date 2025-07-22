import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

const ShadDropdown = ({ items = [], value, onChange, placeholder = "All Categories" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      {open && (
        <div
          className="fixed inset-0 bg-transparent"
          style={{ backdropFilter: "blur(3px)", zIndex: 40 }}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className="px-4 py-2 rounded border bg-white text-black min-w-[160px] text-left flex items-center justify-between"
            type="button"
            style={{ position: "relative", zIndex: 50 }}
          >
            <span>{value || placeholder}</span>
            {/* Arrow: right (→) when closed, down (↓) when open */}
            <svg
              className="transition-transform duration-200 ml-2"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              {open ? (
                // Down arrow
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                // Right arrow
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className="bg-white rounded shadow min-w-[160px] py-1"
          side="bottom"
          sideOffset={5}
          style={{ zIndex: 60 }}
        >
          <DropdownMenu.Item
            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            onSelect={() => onChange({ target: { value: "" } })}
          >
            {placeholder}
          </DropdownMenu.Item>
          {items.map((item) => (
            <DropdownMenu.Item
              key={item}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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