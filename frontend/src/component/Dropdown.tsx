import React, { useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Select, Space } from "antd";
import type { InputRef } from "antd";

interface DropdownProps {
  setQuestionTimeLimit: React.Dispatch<React.SetStateAction<number>>;
  disabled: boolean;
  questionTimeLimit: number;
}

const Dropdown = ({
  setQuestionTimeLimit,
  disabled,
  questionTimeLimit,
}: DropdownProps) => {
  const [items, setItems] = useState<number[]>([15, 30, 45, 60]);

  const inputRef = useRef<InputRef>(null);
  const [timer, setTimer] = useState<number>(questionTimeLimit);

  const [val, setVal] = useState<string>("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVal(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setItems([...items, num]);
    }
    setVal("");
  };

  return (
    <Select
      style={{ width: 200 }}
      placeholder="Timer"
      className=""
      defaultValue={timer}
      onChange={(value) => {
        setTimer(value);
        setQuestionTimeLimit(value);
      }}
      disabled={disabled}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "0 8px 4px" }}>
            <Input
              placeholder="Enter Time"
              ref={inputRef}
              value={val}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addItem}
              className="!bg-gradient-to-r !from-[#7765DA] !to-[#4F0DCE]"
            >
              Add
            </Button>
          </Space>
        </>
      )}
      options={items.map((item) => ({ label: item+' seconds', value: item }))}
    />
  );
};

export default Dropdown;
