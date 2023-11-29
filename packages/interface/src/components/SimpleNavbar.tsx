import { NavButton } from '@/components/Button';

export default function SimpleNavbar() {
  const items = [
    {
      name: 'HOME',
      link: '/home',
    },
    {
      name: 'OPEN PACK',
      link: '/open-pack/buy',
    },
    {
      name: 'MY PACKS',
      link: '/my-packs',
    },
  ];
  return (
    <div className='flex flex-row justify-between gap-4'>
      {items.map((item, index) => {
        return (
          <div key={`navbar-${index}`} className='h-[60px] w-[60px]'>
            <a href={item.link}>
              <NavButton key={index}>{item.name}</NavButton>
            </a>
          </div>
        );
      })}
    </div>
  );
}
