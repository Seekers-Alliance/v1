'use client';
import {PrimaryButton} from "@/components/Button";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();
    const handleBuyPack = () => {
        router.push('/open-pack/buy');
    };
    const handleSetupDrawingPool = () => {
        router.push('/manage/');
    };
  return (
    <main className='flex flex-col min-h-screen items-center justify-center bg-gray-800 p-24'>
        <div className='flex flex-col items-center gap-2'>
            <div className='w-[500px] h-[50px]'>
                <PrimaryButton onClick={handleBuyPack}>
                    User Story - Buy Pack
                </PrimaryButton>
            </div>
            <div className='w-[500px] h-[50px]'>
                <PrimaryButton onClick={handleSetupDrawingPool}>
                    Manager Story - Setup Drawing Pool
                </PrimaryButton>
            </div>
        </div>
    </main>
  );
}
