/*
 * dark mode settings
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import {SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  removeKeysByName,
  retrieveDarkMode as localstorageRetrieveDarkMode,
  saveDarkMode as localstorageSaveDarkMode
  } from '../../util/localstorage';
const menuSettings = {
  mainbar: {title: 'By main bar icon', help: 'The dark mode is set by icon in main bar'},
  os: {title: 'By OS settings', help: 'The dark mode follows your OS settings'},
  skpath: {title: 'By Signal K Mode', help: 'The dark mode follows the value of Signal K path: /vessels/self/environment/mode'}
}

export const darkModeSetByMainbar = "mainbar";
export const darkModeSetByOs = "os";
export const darkModeSetBySkPath = "skpath";
export const darkModeLight = "light";
export const darkModeDark = "dark";


export default class DarkModeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = localstorageRetrieveDarkMode();
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selectedKey) {
    var newDarkModeToSave = this.state;
    newDarkModeToSave.darkModeSetBy = selectedKey;
    newDarkModeToSave.darkModeCurrent = this.props.instrumentPanel.getDarkModeValue();
    this.setState({darkModeSetBy: selectedKey});
    this.props.instrumentPanel.setDarkModeSetBy(selectedKey);
    this.props.instrumentPanel.reloadRequired = (selectedKey === darkModeSetByOs);
    localstorageSaveDarkMode(newDarkModeToSave);
  }

  render() {
    var menuItems = Object.keys(menuSettings).map(key => {
      return <MenuItem key={key} eventKey={key} onSelect={this.handleSelect} active={this.state.darkModeSetBy === key}>{menuSettings[key].title}</MenuItem>
    });
    var OsSupportText = (
      (this.state.darkModeSetBy === darkModeSetByOs) &&
      (! this.props.instrumentPanel.colorScheme.hasNativeSupport)
    ) ? '<strong> but your OS does not support it</strong>' : '';
    return (
      <div className="darkmodeSettings">
        <div>Select how the dark mode will be activated:</div>
        <SplitButton
          bsStyle="default"
          title={menuSettings[this.state.darkModeSetBy].title}
          key="darkmodeKey"
          id="darkmodeDropdown"
          className="navbar-btn">
          {menuItems}
        </SplitButton>
        <div>
          {menuSettings[this.state.darkModeSetBy].help + OsSupportText}
        </div>
      </div>
    );

  }
};

DarkModeSettings.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
