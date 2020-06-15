import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useThemeContext from "@theme/hooks/useThemeContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const blogs = [
  {
    imageUrl: "https://miro.medium.com/max/1400/1*IR_lvEYJ55v0n5R5M_VVGg.png",
    title: "GraphQL ResolveInfo Deep Dive",
    description: `Efficient GraphQL resolvers by generating database queries and the internals of a GraphQL integration.`,
    url: "https://blog.grandstack.io/graphql-resolveinfo-deep-dive-1b3144075866"
  },
  {
    imageUrl: "https://miro.medium.com/max/1000/1*Jxjh_ZCog2m-RXGO9EJmQQ.png",
    title: "Multi-Tenant GraphQL With Neo4j 4.0",
    description: `A look at using Neo4j 4.0 multidatabase with neo4j-graphql.js.`,
    url:
      "https://blog.grandstack.io/multitenant-graphql-with-neo4j-4-0-4a1b2b4dada4"
  },
  {
    imageUrl: "https://miro.medium.com/max/1400/1*ZhsGSUT-wFHFHRLmLn3pYA.png",
    title: "Working With Spatial Data In Neo4j GraphQL In The Cloud",
    description: `Serverless GraphQL, Neo4j Aura, geospatial data, and GRANDstack. `,
    url:
      "https://blog.grandstack.io/working-with-spatial-data-in-neo4j-graphql-in-the-cloud-eee2bf1afad"
  },
  {
    imageUrl: "https://miro.medium.com/max/1400/1*D4jGKxQRLxDyAEbV2DuHeA.png",
    title: "Complex GraphQL Filtering With neo4j-graphql.js",
    description: `Use filtering in your GraphQL queries without writing any resolvers.`,
    url:
      "https://blog.grandstack.io/complex-graphql-filtering-with-neo4j-graphql-js-aef19ad06c3e"
  }
];

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

function Blog({ imageUrl, title, description, url }) {
  const imgUrl = imageUrl; //useBaseUrl(imageUrl);

  return (
    <div className={classnames("col col--3")}>
      <a href={url} target="_blank" className={classnames(styles.blogText)}>
        <div className={classnames(styles.blogCard, "card", "text--center")}>
          <div class="card__image">
            <img
              className={(styles.featureImage, styles.blogImage)}
              src={imgUrl}
              alt={title}
            />
          </div>
          <div class="card_body">
            <h4 className={classnames(styles.blogText)}>{title}</h4>
            <small className={classnames(styles.blogText)}>{description}</small>
          </div>
          <div class="card__footer">
            <button class="button button--primary">Read Now</button>
          </div>
        </div>
      </a>
    </div>
  );
}

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

function BlogFeatures() {
  return (
    <section>
      <div className={classnames("container")}>
        <h1 className="text--center">From The Blog</h1>
        <div className={classnames(styles.cardContainer, "row")}>
          {blogs.map((props, idx) => (
            <Blog key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BookPromo() {
  return (
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
            <a href="https://grandstack.io/book" target="_blank">
              <img
                className={classnames(styles.mainItem)}
                src={useBaseUrl("img/bookcover_med.png")}
              ></img>
            </a>
          </div>
          <div class="col col--7">
            <a href="https://grandstack.io/book" target="_blank">
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
                <strong>Part 1: Getting Started With Fullstack GraphQL</strong>
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
                <li>
                  <i>Chapter 6:</i> Connecting Our React App To Our API
                </li>
              </ul>
              <li>
                <strong>Part 3: Fullstack Considerations</strong>
              </li>
              <ul>
                <li>
                  <i>Chapter 7:</i> Adding Authorization
                </li>
                <li>
                  <i>Chapter 8:</i> Deploying Our Application
                </li>
                <li>
                  <i>Chapter 9:</i> Advanced GraphQL
                </li>
              </ul>
            </ul>
            <div class="text--center">
              <a href="https://grandstack.io/book" target="_blank">
                <button class="button button-outline button--primary">
                  Read Now!
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const context = useDocusaurusContext();

  const themeContext = useThemeContext();

  const { siteConfig = {} } = context;
  return (
    <Layout
      title="Build Fullstack GraphQL Applications With Ease"
      description="Build Fullstack GraphQL Applications With Ease"
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
              Build Fullstack{" "}
              <span className={styles.heroProjectKeywords}>GraphQL</span>{" "}
              Applications With{" "}
              <span className={styles.heroProjectKeywords}>Ease</span>
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

        <BookPromo />
        <BlogFeatures />
      </main>
    </Layout>
  );
}

export default Home;
