import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useThemeContext from "@theme/hooks/useThemeContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const features = [
  {
    title: <>GraphQL</>,
    imageUrl: "img/logo/graphql.svg",
    description: (
      <>Use GraphQL to model and query your application data as a graph.</>
    )
  },
  {
    title: <>React</>,
    imageUrl: "img/logo/react.svg",
    description: <>Build reusable and composable user interface components.</>
  },
  {
    title: <>Apollo</>,
    imageUrl: "img/logo/apollo.svg",
    description: (
      <>
        Consistent tooling for GraphQL across server-side and client-side
        development.
      </>
    )
  },
  {
    title: <>Neo4j Database</>,
    imageUrl: "img/logo/neo4j.svg",
    description: (
      <>
        Model, store, and query your data the same way you think about it: as a
        graph.
      </>
    )
  }
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames("col col--3", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3 className="text--center">{title}</h3>
      <p className="text--center">{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  console.log(context);
  const themeContext = useThemeContext();
  console.log("dark theme");
  console.log(themeContext);
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={siteConfig.title}
      description="Build fullstack graph applications with ease"
    >
      <main>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroProjectTagline}>
              <img
                alt="GRANDstack"
                className={styles.heroLogo}
                src={useBaseUrl("img/GrandStack-Logo-Vert_Alt.png")}
              />
              Build fullstack{" "}
              <span className={styles.heroProjectKeywords}>graph</span>{" "}
              applications with{" "}
              <span className={styles.heroProjectKeywords}>ease</span>
            </h1>
            <div className={styles.indexCtas}>
              <Link
                className={styles.indexCtasGetStartedButton}
                to={useBaseUrl("docs/getting-started-neo4j-graphql")}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div
          className={classnames(styles.announcement, styles.announcementDark)}
        >
          <div className={styles.announcementInner}>
            npx create-grandstack-app myApp
          </div>
        </div>

        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          className={
            true
              ? classnames(styles.features)
              : classnames(styles.features, styles.shaded)
          }
        >
          <div className="container">
            <div className="row">
              <div class="col col--5">
                <img
                  className={classnames(styles.mainItem)}
                  src={useBaseUrl("img/bookcover.png")}
                ></img>
              </div>
              <div class="col col--7">
                <h3 class="text--center">
                  New Book Release! Fullstack GraphQL Applications with
                  GRANDstack
                </h3>
                <p>
                  The following topics are covered as we build a fullstack
                  application using GraphQL, React, Apollo, and Neo4j Database:
                </p>
                <ul>
                  <li>What's the GRANDstack?</li>
                  <li>Graph Thinking With GraphQL</li>
                  <li>Graphs In The Database</li>
                  <li>A GraphQL API For Our Graph Database</li>
                  <li>Building User Interfaces With React</li>
                  <li>Connecting Our React App To Our API</li>
                  <li>Adding Authorization</li>
                  <li>Deploying Our Application</li>
                  <li>Advanced GraphQL</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
