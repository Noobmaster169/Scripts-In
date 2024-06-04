import type { NextPage } from "next";
import Head from "next/head";
import { InitUser } from "../views";

const NewUser: NextPage = (props) => {  
    return (
    <div>
      <Head>
        <title>Create New Account</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <InitUser/>
    </div>
  );
};

export default NewUser;
