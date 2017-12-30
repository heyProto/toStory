import React from 'react';
import ReactDOM from 'react-dom';
import StoryCard from './src/js/Container.jsx';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};

ProtoGraph.Card.toStory = function () {
  this.cardType = 'toStoryCard';
}

ProtoGraph.Card.toStory.prototype.init = function (options) {
  this.options = options;
}

ProtoGraph.Card.toStory.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toStory.prototype.renderSixteenCol= function (data) {
  this.mode = '16_col';
  ReactDOM.render(
    <StoryCard
      dataURL={this.options.data_url}
      selector={this.options.selector}
      domain= {this.options.domain}
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
ProtoGraph.Card.toStory.prototype.renderSevenCol= function (data) {
  this.mode = '7_col';
  ReactDOM.render(
    <StoryCard
      dataURL={this.options.data_url}
      selector={this.options.selector}
      domain= {this.options.domain}
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

ProtoGraph.Card.toStory.prototype.renderFourCol= function (data) {
  this.mode = '4_col';
  ReactDOM.render(
    <StoryCard
      dataURL={this.options.data_url}
      selector={this.options.selector}
      domain= {this.options.domain}
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


ProtoGraph.Card.toStory.prototype.renderThreeCol= function (data) {
  this.mode = '3_col';
  ReactDOM.render(
    <StoryCard
      dataURL={this.options.data_url}
      selector={this.options.selector}
      domain= {this.options.domain}
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

ProtoGraph.Card.toStory.prototype.renderTwoCol= function (data) {
  this.mode = '2_col';
  ReactDOM.render(
    <StoryCard
      dataURL={this.options.data_url}
      selector={this.options.selector}
      domain= {this.options.domain}
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