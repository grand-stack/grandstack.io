/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Index extends React.Component {
  render() {
    let language = this.props.language || "";

    return <div>Welcome To GRANDstack</div>;
  }
}

module.exports = Index;
