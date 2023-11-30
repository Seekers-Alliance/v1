import { Avatar, List, Skeleton } from 'antd';
import { useState } from 'react';

interface DataType {
  gender?: string;
  name: {
    title?: string;
    first?: string;
    last?: string;
  };
  email?: string;
  picture: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
  nat?: string;
  loading: boolean;
}

interface RecipientData {}

export default function RecipientList() {
  // const [data, setData] = useState<DataType[]>([]);
  const [list, setList] = useState<DataType[]>([]);
  const data = Array(10)
    .fill(0)
    .map((_, i) => {
      return {
        gender: 'man',
        name: {
          title: 'mr',
          first: 'jese',
          last: 'leos',
        },
        email: 'wade@gmail.com',
        picture: {
          large: 'xl',
          medium: 'md',
          thumbnail: 'sm',
        },
        nat: 'us',
      };
    });

  return (
    <List
      className='demo-loadmore-list'
      itemLayout='horizontal'
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          actions={[
            <a key='list-loadmore-edit'>edit</a>,
            <a key='list-loadmore-more'>more</a>,
          ]}
        >
          {/*<Skeleton avatar title={false} active>*/}
          <List.Item.Meta
            avatar={<Avatar src={item.picture.large} />}
            title={<a href='https://ant.design'>{item.name?.last}</a>}
            description='Ant Design, a design language for background applications, is refined by Ant UED Team'
          />
          <div>content</div>
          {/*</Skeleton>*/}
        </List.Item>
      )}
    />
  );
}
