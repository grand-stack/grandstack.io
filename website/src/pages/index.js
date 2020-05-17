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

  const themeContext = useThemeContext();

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
            <h1 class="text--center">New Book Release!</h1>
            <div className="row">
              <div class="col col--5">
                <a href="https://grandstack.io/book">
                  <img
                    className={classnames(styles.mainItem)}
                    src={useBaseUrl("img/bookcover_med.png")}
                  ></img>
                </a>
              </div>
              <div class="col col--7">
                <a href="https://grandstack.io/book">
                  <h2 class="text--center">
                    Fullstack GraphQL Applications with GRANDstack
                  </h2>
                </a>
                <p>
                  Learn how to build a fullstack GraphQL application using using
                  GraphQL, React, Apollo, and Neo4j Database. The book covers:
                </p>
                <ul>
                  <li>
                    <strong>
                      Part 1: Getting Started With Fullstack GraphQL
                    </strong>
                  </li>
                  <ul>
                    <li>
                      <i>Chapter 1:</i> What's the GRANDstack?
                    </li>
                    <li>
                      <i>Chapter 2:</i> Graph Thinking With GraphQL
                    </li>
                    <li>
                      <i>Chapter 3:</i> Graphs In The Database
                    </li>
                    <li>
                      <i>Chapter 4:</i> A GraphQL API For Our Graph Database
                    </li>
                  </ul>
                  <li>
                    <strong>Part 2: Building The Front End</strong>
                  </li>
                  <ul>
                    <li>
                      <i>Chapter 5:</i> Building User Interfaces With React
                    </li>
                    <li>Chapter 6: Connecting Our React App To Our API</li>
                  </ul>
                  <li>
                    <strong>Part 3: Fullstack Considerations</strong>
                  </li>
                  <ul>
                    <li>Chapter 7: Adding Authorization</li>
                    <li>Chapter 8: Deploying Our Application</li>
                    <li>Chapter 9: Advanced GraphQL</li>
                  </ul>
                </ul>
                <div class="text--center">
                  <a href="https://grandstack.io/book">
                    <button class="button button-outline button--primary">
                      Buy Now!
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
