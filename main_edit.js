import React from 'react';
import { render } from 'react-dom';
import EditCard from './src/js/edit_card.jsx';

ProtoGraph.Card.toStory.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toStory.prototype.renderSEO = function (data) {
  return this.containerInstance.renderSEO();
}

ProtoGraph.Card.toStory.prototype.renderEdit = function (onPublishCallback) {
  this.onPublishCallback = onPublishCallback;
  render(
    <EditCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      uiSchemaURL={this.options.ui_schema_url}
      domain={this.options.domain}
      siteConfigURL={this.options.site_config_url}
      onPublishCallback={this.onPublishCallback}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
  this.options.selector);
}