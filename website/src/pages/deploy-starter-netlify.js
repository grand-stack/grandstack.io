import React from "react";
import Layout from "@theme/Layout";

function NetlifyRedirect() {
  window.location.href =
    "https://app.netlify.com/start/deploy?repository=https://github.com/grand-stack/grand-stack-starter";

  return (
    <Layout title="Deploy GRANDstack Starter To Netlify">
      <div>
        <p>
          Redirecting to Netlify... Please click{" "}
          <a href="https://app.netlify.com/start/deploy?repository=https://github.com/grand-stack/grand-stack-starter">
            this link
          </a>{" "}
          if not automatically redirected.
        </p>
      </div>
    </Layout>
  );
}

export default NetlifyRedirect;
