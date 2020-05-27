import React from "react";
import Layout from "@theme/Layout";

function VercelRedirect() {
  window.location.href =
    "https://vercel.com/import/project?template=https://github.com/grand-stack/grand-stack-starter";

  return (
    <Layout title="Deploy GRANDstack Starter To Vercel">
      <div>
        <p>
          Redirecting to Vercel... Please click{" "}
          <a href="https://vercel.com/import/project?template=https://github.com/grand-stack/grand-stack-starter">
            this link
          </a>{" "}
          if not automatically redirected.
        </p>
      </div>
    </Layout>
  );
}

export default VercelRedirect;
