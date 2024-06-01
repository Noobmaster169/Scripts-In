import type { NextPage } from "next";
import Head from "next/head";
import { Profile } from "../views";

const Create: NextPage = (props) => {  
    return (
    <div>
      <Head>
        <title>Profile</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <Profile />
    </div>
  );
};

export default Create;
