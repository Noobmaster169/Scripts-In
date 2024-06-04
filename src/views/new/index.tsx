import { FC } from "react";
import { notify } from "../../utils/notifications";
import { useRouter } from 'next/router';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { Gallery } from '../../components/Gallery';
import { ProfileView } from '../../components/Profile';
import { InitializeUser } from '../../components/InitializeUser';

export const InitUser: FC = ({}) => {
  const wallet = useWallet();
  
  return (
    <div className="md:hero mx-auto p-4 w-100">
        <div className="text-center w-100">
            <InitializeUser/>
        </div>
    </div>
  );
};
