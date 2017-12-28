import React from 'react';
import ReactDOM from 'react-dom';
import ArticleCard from './src/js/Container.jsx';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};

ProtoGraph.Card.toArticle = function () {
  this.cardType = 'toArticleCard';
}

ProtoGraph.Card.toArticle.prototype.init = function (options) {
  this.options = options;
}

ProtoGraph.Card.toArticle.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toArticle.prototype.renderSixteenCol= function (data) {
  this.mode = '16_col';
  ReactDOM.render(
    <ArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      clickCallback={this.options.onClickCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}
ProtoGraph.Card.toArticle.prototype.renderSevenCol= function (data) {
  this.mode = '7_col';
  ReactDOM.render(
    <ArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      clickCallback={this.options.onClickCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}

ProtoGraph.Card.toArticle.prototype.renderFourCol= function (data) {
  this.mode = '4_col';
  ReactDOM.render(
    <ArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      clickCallback={this.options.onClickCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}


ProtoGraph.Card.toArticle.prototype.renderThreeCol= function (data) {
  this.mode = '3_col';
  ReactDOM.render(
    <ArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      clickCallback={this.options.onClickCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}

ProtoGraph.Card.toArticle.prototype.renderTwoCol= function (data) {
  this.mode = '2_col';
  ReactDOM.render(
    <ArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      clickCallback={this.options.onClickCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}