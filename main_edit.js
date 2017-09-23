import React from 'react';
import ReactDOM from 'react-dom';
import EditArticleCard from './src/js/EditContainer.jsx';

ProtoGraph.Card.toArticle.prototype.getData = function (data) {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toArticle.prototype.renderSEO = function (data) {
  this.renderMode = 'SEO';
  return this.containerInstance.renderSEO();
}

ProtoGraph.Card.toArticle.prototype.renderEdit = function (onPublishCallback) {
  this.mode = 'edit';
  this.onPublishCallback = onPublishCallback;
  ReactDOM.render(
    <EditArticleCard
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      optionalConfigURL={this.options.configuration_url}
      optionalConfigSchemaURL={this.options.configuration_schema_url}
      onPublishCallback={this.onPublishCallback}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}