import { CustomTagProps } from 'rc-select/es/BaseSelect';
import { Select, Tag } from 'antd';
import React, { useMemo } from 'react';
import chroma from 'chroma-js';

interface NFTMultiSelectProps {
  selectedId?: BigInt[];
  nftList: NFTInfo[];
  onSelect?: (idList: BigInt[]) => void;
}

interface NFTInfo {
  id: BigInt;
  title: string;
}

export default function NFTMultiSelect({
  selectedId,
  nftList,
  onSelect,
}: NFTMultiSelectProps) {
  const options = useMemo(() => {
    return nftList.map(({ id, title }) => ({
      label: title,
      value: encodeValue(id, chroma.random().hex()),
    }));
  }, [nftList]);
  const defaultSelected = useMemo(() => {
    const set = new Set<BigInt>(selectedId);
    return options
      .filter((option) => set.has(decodeValue(option.value)[0]))
      .map((option) => option.value);
  }, [selectedId, options]);
  const handleSelectedOptionChange = (key: string[]) => {
    const idList = key.map((key) => decodeValue(key)[0]);
    if (onSelect) {
      onSelect(idList);
    }
  };
  console.log(options);
  return (
    <Select
      mode='multiple'
      defaultValue={defaultSelected}
      tagRender={tagRender}
      style={{ width: '100%' }}
      options={options}
      onChange={handleSelectedOptionChange}
    />
  );
}

const tagRender = (props: CustomTagProps) => {
  const { label, value, closable, onClose } = props;
  const [id, color] = decodeValue(value);
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={color}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {label}
    </Tag>
  );
};

function encodeValue(id: BigInt, color: string): string {
  return `${id}-${color}`;
}

function decodeValue(value: string): [BigInt, string] {
  const [id, color] = value.split('-');
  return [BigInt(id), color];
}
