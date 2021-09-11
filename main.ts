import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

declare module "obsidian" {
  interface App {
    changeBaseFontSize: any
  }
}

interface ResetFontSizeSettings {
  defaultBaseFontSize: number;
  ribbonIcon: boolean;
}

const DEFAULT_SETTINGS: ResetFontSizeSettings = {
  defaultBaseFontSize: 16,
  ribbonIcon: true
}

export default class ResetFontSizePlugin extends Plugin {
  settings: ResetFontSizeSettings;
  ribbonIconEl: HTMLElement | undefined = undefined;

  async onload() {
    console.log('loading %s plugin', this.manifest.name);

    await this.loadSettings();

    this.addCommand({
      id: 'reset-font-size',
      name: 'Reset',
      callback: () => this.doReset()
    });

    this.refreshRibbonIcon();
    this.addSettingTab(new ResetFontSizeSettingsTab(this.app, this));

  }

  onunload() {
    console.log('unloading %s plugin', this.manifest.name);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  refreshRibbonIcon = () => {
    this.ribbonIconEl?.remove();
    if (this.settings.ribbonIcon) {
      this.ribbonIconEl = this.addRibbonIcon(
        'uppercase-lowercase-a',
        'Reset Font Size',
        () => this.doReset()
      );
    }
  };

  doReset() {
    this.app.changeBaseFontSize(this.settings.defaultBaseFontSize);
    //console.log('reset font size to: %d', s);
  }

}

class ResetFontSizeSettingsTab extends PluginSettingTab {
  plugin: ResetFontSizePlugin;

  constructor(app: App, plugin: ResetFontSizePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h2', {text: 'Reset Font Size Settings'});
    let desc = document.createDocumentFragment();
    desc.append(`Size to revert to when invoking the reset command (default: ${String(DEFAULT_SETTINGS.defaultBaseFontSize)})`);
    desc.createEl("br")
    desc.append('Current setting: ')
    desc.appendChild(this.curSize);
    this.updateSettingsDesc()
    new Setting(containerEl)
      .setName('Default Font Size')
      .setDesc(desc)
      .addSlider((slider) => {
        slider
          .setDynamicTooltip()
          .setLimits(10, 30, 1)
          .setValue(this.plugin.settings.defaultBaseFontSize)
          .onChange((new_value) => {
            this.plugin.settings.defaultBaseFontSize = new_value;
            this.updateSettingsDesc();
            this.plugin.saveSettings();
          });
      });
    new Setting(containerEl)
      .setName('Show Ribbon Icon')
      .setDesc('Toggle the display of the Ribbon Icon.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.ribbonIcon)
          .onChange((value) => {
            this.plugin.settings.ribbonIcon = value;
            this.plugin.saveSettings();
            this.plugin.refreshRibbonIcon();
        })
      );
  }

  private updateSettingsDesc() {
    this.curSize.innerText = String(this.plugin.settings.defaultBaseFontSize);
  }

  curSize = document.createElement('b');

}
