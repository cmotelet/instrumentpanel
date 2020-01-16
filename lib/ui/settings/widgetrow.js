/**
 * WidgetRow
 *
 * WidgetRow is a React Component rendering a table row displaying widget
 * information.
 *
 * @widget: An object implementing the BaseWidget interface as defined in
 *   ../widgets/basewidget.js
 */
import { Checkbox, Button } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';

import BaseWidget from '../widgets/basewidget';
import { notificationPageId } from './constants';

export default class WidgetRow extends React.Component {
  constructor(props) {
    super(props);
    this.toggleActive = this.toggleActive.bind(this);
    this.toggleShowAllPaths = this.toggleShowAllPaths.bind(this);
    this.getFullPathList = this.getFullPathList.bind(this);
    this.state = {
      showAllPaths: false
    }
  }

  getFullPathList() {
    var that = this;
    var pathsWidget = Array.from(this.props.widget.instrumentPanel.getPathsByWidgetType(this.props.widget.getType()));
    if (pathsWidget.length === 0) {
      pathsWidget.unshift("This widget handles all paths that don't have a dedicated widget.");
    } else {
      pathsWidget.unshift("This widget can also handle the following paths :");
    }
    return pathsWidget.map(function(path, i) {
      const currentPath = path;
      if (!that.props.widget.getHandledSources().some( source => source.path === currentPath )) {
        return (
          <p key={"x-"+i} onClick={that.toggleShowAllPaths}>
            {path.replace(/\./g, '.' + String.fromCharCode(8203))}
          </p>
        )
      }
    });
  }

  render() {
    const showAllPaths = this.state.showAllPaths;
    var that = this;
    var paths =
      this.props.widget.getHandledSources().map(function(source, i) {
        return (
          <p key={i} onClick={that.toggleShowAllPaths}>
            {(i === 0)?((showAllPaths)?'[-]':'[+]'):null}
            <b>{source.path.replace(/\./g, '.' + String.fromCharCode(8203))}</b>
            {String.fromCharCode(8203) + " (" + source.sourceId})
          </p>
        )
      });

    return (
      <div className='item'>
        <div className='copy'>
          <Checkbox checked={this.props.widget.options.active} onChange={this.toggleActive} >
            Visible
          </Checkbox>
          <h3>{this.props.widget.getType()}</h3>
          {paths}
          {(this.state.showAllPaths)?this.getFullPathList():null}
        </div>
        <div className='widget'>
            {this.props.widget.getReactElement()}
        </div>
        <div className='widgetSettings'>
            {this.props.widget.getSettingsElement()}
        </div>
      </div>
    );
  }

  toggleActive() {
    this.props.widget.setActive(!this.props.widget.options.active);
    if (this.props.widget.instrumentPanel.currentPage === notificationPageId) {
      this.props.widget.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.widget.instrumentPanel.pushGridChanges();
      }
  }

  toggleShowAllPaths() {
  this.setState({
      showAllPaths: !this.state.showAllPaths
    });
  }

};

WidgetRow.propTypes = {
  widget: PropTypes.instanceOf(BaseWidget).isRequired
};
