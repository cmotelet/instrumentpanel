import React from 'react';
import PropTypes from 'prop-types';
import {Panel, ButtonGroup, Button, Alert, SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';
import PreferredUnits from './preferredunits';
import ResetSettings from './resetsettings';
import ColorSchemeSettings from './colorschemesettings';
import {
  widgetActiveModes,
  notificationPageId,
  WA_BASE_DATA,
  WA_ALL,
  WA_NO
} from './constants'

const settingsTitle = [
  "Widget",
  "Preferred Units",
  "Dark Mode",
  "Reset Instrument Panel"
];

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 0,
      displayMessage: false,
      widgetActiveMode: this.props.instrumentPanel.widgetActiveMode
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.handlewidgetActiveMode = this.handlewidgetActiveMode.bind(this);
    this.hideAll = this.hideAll.bind(this);
    this.showAll = this.showAll.bind(this);
    this.getButtonBySettingsKey = this.getButtonBySettingsKey.bind(this);
    this.getContentBySettingsKey = this.getContentBySettingsKey.bind(this);
    this.applyPreferredUnits = this.applyPreferredUnits.bind(this);
    this.resetPreferredUnits = this.resetPreferredUnits.bind(this);
  }

  render() {

    var reloadMessage =
      (<Alert bsStyle="warning"><strong>Reload is required</strong> This will be done when you leave settings tab.</Alert>);
    var count = -1;
    var menuItems = settingsTitle.map(key => {
      count +=1;
      return <MenuItem key={count} eventKey={count} onSelect={this.handleSelect} active={this.state.activeKey === count}>{key}</MenuItem>
    });
    return (
      <React.Fragment>
        {(this.props.instrumentPanel.isReloadRequired())? reloadMessage : undefined}
        <Panel>
          <Panel.Heading>
            <SplitButton
              bsStyle="default"
              title={"Settings for: " + settingsTitle[this.state.activeKey]}
              key="settingsKey"
              id="settingsDropdown"
              className="navbar-btn">
              {menuItems}
            </SplitButton>
            {this.getButtonBySettingsKey()}
          </Panel.Heading>
          <Panel.Body>{this.getContentBySettingsKey()}</Panel.Body>
        </Panel>
      </React.Fragment>
    )
  }

  getButtonBySettingsKey() {
    if (this.state.activeKey === 0) {
      return (
        <React.Fragment>
          &nbsp;
          <SplitButton
            bsStyle="default"
            title="Hide/Show paths"
            key="hideShowPathKey"
            id="hideShowPathDropdown"
            className="navbar-btn">
            <MenuItem key={0} eventKey="hide" onSelect={this.hideAll}>hide all paths</MenuItem>
            <MenuItem key={1} eventKey="show" onSelect={this.showAll}>show all paths</MenuItem>
          </SplitButton>
          &nbsp;
          <SplitButton
            bsStyle="default"
            title={"Add automatically " + this.state.widgetActiveMode + " paths"}
            key="widgetActiveModeKey"
            id="widgetActiveModeDropdown"
            className="navbar-btn">
            <MenuItem key={0} eventKey={WA_BASE_DATA} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_BASE_DATA}>base data (see help)</MenuItem>
            <MenuItem key={1} eventKey={WA_ALL} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_ALL}>all</MenuItem>
            <MenuItem key={2} eventKey={WA_NO} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_NO}>no</MenuItem>
          </SplitButton>
        </React.Fragment>
      )
    } else if (this.state.activeKey === 1) {
      return(
        <ButtonGroup className="pull-right">
          <Button bsClass="navbar-btn" className="btn" onClick={this.applyPreferredUnits}>Apply</Button>
          <Button bsClass="navbar-btn" className="btn" onClick={this.resetPreferredUnits}>Reset</Button>
        </ButtonGroup>
      )
    } else if (this.state.activeKey === 2) {
      return null;
    } else if (this.state.activeKey === 3) {
      return null;
    }
    return null;
  }

  getContentBySettingsKey() {
    if (this.state.activeKey === 0) {
      return (
        <React.Fragment>
          <div className="center-text">Current layout name: <strong>{this.props.instrumentPanel.layoutName}</strong></div>
          <WidgetList instrumentPanel={this.props.instrumentPanel}/>
        </React.Fragment>
      )
    } else if (this.state.activeKey === 1) {
      return(
        <PreferredUnits instrumentPanel={this.props.instrumentPanel}/>
      )
    } else if (this.state.activeKey === 2) {
      return (
        <ColorSchemeSettings instrumentPanel={this.props.instrumentPanel}/>
      )
    } else if (this.state.activeKey === 3) {
      return (
        <ResetSettings instrumentPanel={this.props.instrumentPanel}/>
      );
    }
    return null;
  }

  applyPreferredUnits() {
    this.props.instrumentPanel.setReloadRequired();
    this.setState({displayMessage: !this.state.displayMessage});
    this.props.instrumentPanel.getPages().map((page, pageNum) => {
      this.props.instrumentPanel.getWidgets(pageNum).map((widget) => {
        const widgetUnit = widget.getOptions().unit;
        if ((widgetUnit !== 'deg') && (widgetUnit !== '') && (typeof widgetUnit !== 'undefined')) {
          widget.options.convertTo = this.props.instrumentPanel.getPreferredUnit(widgetUnit);
        }
      })
    })
    this.props.instrumentPanel.persist();
  }

  resetPreferredUnits() {
    if (confirm("You will reset the settings of your preferred units")) {
      this.props.instrumentPanel.resetPreferredUnit();
    }
  }

  handleSelect(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }

  handlewidgetActiveMode(selectedKey) {
    this.setState({
      widgetActiveMode: selectedKey
    });
    this.props.instrumentPanel.widgetActiveMode = selectedKey;
    this.props.instrumentPanel.saveWidgetActiveMode();
  }

  hideAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = false);
    if (this.props.instrumentPanel.currentPage === notificationPageId) {
      this.props.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.instrumentPanel.pushGridChanges();
      }
  }

  showAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = true);
    if (this.props.instrumentPanel.currentPage === notificationPageId) {
      this.props.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.instrumentPanel.pushGridChanges();
      }
  }

};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
