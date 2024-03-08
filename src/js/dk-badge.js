/**
 * @file dk-badge.js
 * @description A badge to display the carbon footprint of a website
 * @copyright Data & Formulas : DK, all rights reserved, Code : Mozilla Public License (MPL) 2.0
 * @version 0.1.0
 */
class DKBadge {
	constructor(options = {}) {
		// Combine user options with defaults, Object.assign is used to allow
		// the user to only override the options they want to change
    let {style, renderUI, pue, audienceLocationProportion, serverLocationProportion} = Object.assign({
			// Appearance options
			style: "full", // "full", "compact", "footer"
			renderUI: true,

			// Computing options
			pue: 1.69,
			audienceLocationProportion: {
				"france": 0.45,
				"europe": 0,
				"international": 0.55
			},
			serverLocationProportion: {
				"france": 0.5,
				"international": 0.5
			}
		}, options);

		this.node = document.querySelector('[data-dk-badge]');
		this.style = style;
		this.pue = pue;
		this.audienceLocationProportion = audienceLocationProportion;
		this.serverLocationProportion = serverLocationProportion;
		this.renderUI = renderUI;
		// we use the spread operator to allow the user to override only some labels
		// if one label is missing, it will be replaced by the default one
		this.labels = {
			"intro": "This website has a carbon footprint of",
			"emitted": "emitted",
			"details": "Details",
			"weight": "Weight",
			"time": "Time",
			"device": "Device",
			"unknown": "unknown",
			"CO2unit": "g CO2e",
			"weightUnit": "Ko",
			"timeUnit": "sec.",
			"privacy": "no data is collected",
			...options.labels
		};
		this.weight = 0;
		this.timeSpent = 0;
		this.deviceType = 'desktop';
		this.ges = 0;
		this.updateIntervalId = null;
		this.lastCalculatedTimestamp = null;
		this.events = {
			"calculated": new CustomEvent('dkBadge:calculated', {detail: this}),
			"updated": new CustomEvent('dkBadge:updated', {detail: this})
		}

		/**
		 * @copyright DK, all rights reserved
		 */
		this.factors = {
			// server
			"server_lifecycle": 0.023,
			"server_bandwidth": 125000,
			"france_server_efficiency": 6.69e-08,
			"international_server_efficiency": 7.1E-9,
			"france_electricity_carbon_intensity": 0.052,
			"world_electricity_carbon_intensity": 0.357,
			"europe_electricity_carbon_intensity": 0.42,
		
			// network
			"network_lifecycle_impact": 4.78e-09,
			"wifi_consumption": 4.13e-12,
			"g4_consumption": 1.11e-11,
			"server_country_network_ratio": 0.55,
			"viewing_country_network_ratio": 0.45,

			// device
			"mobile_build_emissions": 32.8,
			"desktop_build_emissions": 156.0,
			"tablet_build_emissions": 63.2,
			"mobile_end_of_life_emissions": 0.71,
			"desktop_end_of_life_emissions": 2.1,
			"tablet_end_of_life_emissions": 0.7,
			"mobile_daily_usage": 2.7,
			"mobile_year_usage": 365,
			"mobile_lifetime": 2.5,
			"desktop_lifetime": 5,
			"desktop_daily_usage": 2.02,
			"desktop_year_usage": 253,
			"tablet_lifetime": 3,
			"tablet_daily_usage": 1.5,
			"tablet_year_usage": 365,
			"mobile_power": 4.5,
			"desktop_power": 29.4,
			"tablet_power": 29.4
		};
	}

	/**
	 * Render the badge UI
	 * @private
	 */
	render() {
		if (!this.renderUI) return;
		if (!this.node) return;

		// add an id to the wrapper to up the specificity of the css
		this.node.id = "dk-badge-wrapper"; 

		const template = `
			<div class="dk-badge is-${this.style}">
				<p class="dk-badge_title">
					<span>${this.labels.intro}</span>
					<span class="dk-badge_co2" data-dk-badge-CO2>${this.labels.unknown}</span>
					<span class="dk-badge_co2_unit">${this.labels.emitted}</span>
				</p>
				<button class="dk-badge_button" aria-controls="dk-badge" aria-expanded="false" data-dk-badge-button>
					<svg xmlns='http://www.w3.org/2000/svg' viewBox="-2 -2 20 20" fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2'>
						<path d="M-2 8h20" class="h"/>
						<path d="M-2 8h20" class="v"/>
						<path d="M16 4L8 12L0 4" class="c"/> 
					</svg>
					<span class="sr-only">${this.labels.details}</span>
				</button>
				<div class="dk-badge_content" data-dk-badge-content id="dk-badge">
					<hr class="dk-badge_hr" role="presentation">
					<p class="dk-badge_data">${this.labels.weight}&nbsp;:&nbsp;<strong data-dk-badge-weight>${this.labels.unknown}</strong></p>
					<p class="dk-badge_data">${this.labels.time}&nbsp;:&nbsp;<strong data-dk-badge-time>${this.labels.unknown}</strong></p>
					<p class="dk-badge_data">${this.labels.device}&nbsp;:&nbsp;<strong data-dk-badge-device>${this.labels.unknown}</strong></p>
					<hr class="dk-badge_hr" role="presentation">
					<p class="dk-badge_data"><a href="https://d-k.io/ressources/badge-dk?mtm_campaign=Badge-DK&mtm_source=${document.location}">Powered by DK</a> <span class="is-small">${this.labels.privacy}</span></p>
				</div>
			</div>`;
		this.node.innerHTML = template;
	}

	/**
	 * Check if the device is a mobile or tablet device
	 * Note: this is not a perfect solution, but it's simple and good enough for our needs
	 * @source https://tutorial.eyehunts.com/js/javascript-detect-mobile-or-tablet-html-example-code/
	 * @returns {string} "Mobile", "Tablet" or "Desktop"
	 */
	getUserDevice() {
		const userAgent = navigator.userAgent.toLowerCase();
		const isMobile = /iphone|android/.test(userAgent) ? 'Mobile' : false;
		const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent) ? 'Tablet' : false;

		return isMobile || isTablet || 'Desktop';
	}

	/**
	 * Get the stored data in the session storage
	 * @private
	 */
	getStoredData() {
		let storedData = sessionStorage.getItem('dk-badge');
		if (storedData) {
			storedData = JSON.parse(storedData);
			this.timeSpent = storedData.timeSpent;
			this.weight = storedData.weight;
		}
	}

	/**
	 * Store the time spent & the weight of the page in the session storage
	 * @private
	 */
	storeData() {
		sessionStorage.setItem('dk-badge', JSON.stringify({
			"timeSpent": this.timeSpent,
			"weight": this.weight
		}));
	}

	/**
	 * Calculate the ges of the navigation during the user session
	 * @copyright DK, all rights reserved
	 * @param {number} size - The weight of the page
	 * @param {number} time - The time spent on the page
	 * @param {('Desktop'|'Tablet'|'Mobile')} deviceType - The type of device used by the user
	 */
	calculate(size = this.weight, time = this.timeSpent, deviceType = this.deviceType) {
		const sizeinKo = size / 1000;
		const averages = {
			"wifi_proportion": 0.90,
			"g4_proportion": 0.10,
			"mobile_proportion": deviceType === "Mobile" ? 1 : 0,
			"desktop_proportion": deviceType === "Desktop" ? 1 : 0,
			"tablet_proportion": deviceType === "Tablet" ? 1 : 0
		};

		// parts of the calculation
		const storage = {
			acv: 
			sizeinKo / this.factors.server_bandwidth * this.factors.server_lifecycle / 1000, // output kgco2
			usage:
				((this.serverLocationProportion.france *
					this.factors.france_server_efficiency *
					this.factors.france_electricity_carbon_intensity) +
					(this.serverLocationProportion.international *
						this.factors.international_server_efficiency *
						this.factors.world_electricity_carbon_intensity)) *
				(this.pue * sizeinKo),
		};

		const calc_wifi_consumption = averages.wifi_proportion * this.factors.wifi_consumption * 8000
		const calc_g4_consumption = averages.g4_proportion * this.factors.g4_consumption * 8000
		const calc_network_total = averages.wifi_proportion + averages.g4_proportion

		const calc_france_server_ratio_electricity_intensity = this.serverLocationProportion.france * this.factors.france_electricity_carbon_intensity
		const calc_international_server_ratio_electricity_intensity = this.serverLocationProportion.international * this.factors.world_electricity_carbon_intensity
		const calc_country_server_total = this.serverLocationProportion.france + this.serverLocationProportion.international

		const calc_france_viewing_country_ratio_carbon_intensity = this.audienceLocationProportion.france * this.factors.france_electricity_carbon_intensity
		const calc_europe_viewing_country_ratio_carbon_intensity = this.audienceLocationProportion.europe * this.factors.europe_electricity_carbon_intensity
		const calc_international_viewing_country_ratio_carbon_intensity = this.audienceLocationProportion.international * this.factors.world_electricity_carbon_intensity
	
		const network = {
			acv: this.factors.network_lifecycle_impact * sizeinKo,
			usage:
				sizeinKo * ((calc_wifi_consumption + calc_g4_consumption) / calc_network_total) * ((this.factors.server_country_network_ratio * (calc_france_server_ratio_electricity_intensity + calc_international_server_ratio_electricity_intensity) / calc_country_server_total) + (this.factors.viewing_country_network_ratio * ((calc_france_viewing_country_ratio_carbon_intensity + calc_europe_viewing_country_ratio_carbon_intensity + calc_international_viewing_country_ratio_carbon_intensity)))),
		};

		const calc_device_total = averages.mobile_proportion + averages.desktop_proportion + averages.tablet_proportion;

		const calc_mobile_acv_emissions = this.factors.mobile_build_emissions + this.factors.mobile_end_of_life_emissions;
		const calc_mobile_lifetime = this.factors.mobile_daily_usage * this.factors.mobile_year_usage * this.factors.mobile_lifetime;
		const calc_mobile_ratio_share = averages.mobile_proportion * calc_mobile_acv_emissions / calc_mobile_lifetime;
		const calc_mobile_ratio_power = averages.mobile_proportion * this.factors.mobile_power;

		const calc_desktop_acv_emissions = this.factors.desktop_build_emissions + this.factors.desktop_end_of_life_emissions;
		const calc_desktop_lifetime = this.factors.desktop_daily_usage * this.factors.desktop_year_usage * this.factors.desktop_lifetime;
		const calc_desktop_ratio_share = averages.desktop_proportion * calc_desktop_acv_emissions / calc_desktop_lifetime;
		const calc_desktop_ratio_power = averages.desktop_proportion * this.factors.desktop_power;

		const calc_tablet_acv_emissions = this.factors.tablet_build_emissions + this.factors.tablet_end_of_life_emissions;
		const calc_tablet_lifetime = this.factors.tablet_daily_usage * this.factors.tablet_year_usage * this.factors.tablet_lifetime;
		const calc_tablet_ratio_share = averages.tablet_proportion * calc_tablet_acv_emissions / calc_tablet_lifetime;
		const calc_tablet_ratio_power = averages.tablet_proportion * this.factors.tablet_power;

	
		const device = {
			acv:
				time * (calc_mobile_ratio_share + calc_desktop_ratio_share + calc_tablet_ratio_share) / calc_device_total / 3600,
			usage:
				(time / 3600) * ((calc_mobile_ratio_power + calc_desktop_ratio_power + calc_tablet_ratio_power) / calc_device_total) * (((calc_france_viewing_country_ratio_carbon_intensity / 1000) + (calc_europe_viewing_country_ratio_carbon_intensity / 1000) + (calc_international_viewing_country_ratio_carbon_intensity / 1000)))
		};
	
		// Add everything & convert in grams
		this.ges = (storage.acv+storage.usage+network.acv+network.usage+device.acv+device.usage) * 1000;

		// update the timestamp
		this.lastCalculatedTimestamp = performance.now();

		// dispatch the event dkBadge:calculated
		document.dispatchEvent(this.events.calculated);

		return this.ges;
	}

	/**
	 * Update the value of a dk-badge element
	 * @param {string} key - [data-dk-badge-${key}]
	 * @param {string} value
	 * @private
	 */
	updateElement(key, value) {
		if (!this.renderUI) return;
		const node = this.node.querySelector(`[data-dk-badge-${key}]`);
		if (!node) return;
		node.innerHTML = value;
	}

	/**
	 * Update the badge UI with the new values
	 * @private
	 */
	update() {
		if (!this.renderUI) return;
		var values = [
			{
				"key": "CO2",
				"value": this.ges.toFixed(2) + ' ' + this.labels.CO2unit
			},
			{
				"key": "time",
				"value": this.timeSpent + ' ' + this.labels.timeUnit
			},
			{
				"key": "device",
				"value": this.deviceType
			},
			{
				"key": "weight",
				"value": (this.weight / 1000).toFixed(2) + ' ' + this.labels.weightUnit
			}
		];
		values.forEach((value) => {
			this.updateElement(value.key, value.value);
		});

		// dispatch the event dkBadge:updated
		document.dispatchEvent(this.events.updated);
	}

	/**
	 * update the weight of the page & run the calculation
	 * @param {PerformanceEntryList} list
	 * @private
	 */
	getResources(list = performance.getEntries()) {
		if (!list) return;
		if (list.length !== 0) {
			list.forEach((entry, index) => {
				if ("transferSize" in entry) {
					this.weight = this.weight + entry.transferSize
				}
			});
		}

		this.calculate();
	}

	/**
	 * Callback of the performance observer, run getResources with the new entries
	 * @param {PerformanceObserverEntryList} list
	 * @private
	 */
	performanceObserverCallback(list) {
		this.getResources(list.getEntries());
	}

	/**
	 * Update the time spent on the page & run the calculation periodically
	 * @private
	 * @returns {number} setInterval id
	 */
	updateInterval() {
		return setInterval(() => {
			this.timeSpent += 1; // 1 seconds
			this.storeData();
	
			// Update the badge if it has not already been updated
			// in the last 5 seconds (to avoid performance issues)
			// the performance observer handles when resources are added,
			// otherwise we just update with the time spent
			// the gap is not that big with only seconds updating
			if (performance.now() - this.lastCalculatedTimestamp >= 5000) {
				this.getResources([]);
			} else {
				this.updateElement('time', this.timeSpent + ' ' + this.labels.timeUnit);
			}
		}, 1000);	
	};

	/**
	 * Handle the visibility change of the tab
	 * The process update only when the tab is visible
	 * it avoids using performances for nothing & it's more accurate for computing
	 * @private
	 */
	handleVisibilityChange(){
		if (document.hidden) {
			clearInterval(this.updateIntervalId)
			this.updateIntervalId = null;
		} else {
			this.updateIntervalId = this.updateIntervalId || this.updateInterval();
		}
	}

	/**
	 * An implementation of the disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
	 * @param {node} node The button toggle
	 * @param {string} mode toggle or close to force close on blur & escape
	 * @example
	 *  <div data-dk-badge>
				<button aria-controls="dk-badge" aria-expanded="false" data-dk-badge-button>bouton</button>
				<div id="dk-badge" dk-badge_content>
					...
				</div>
			</div>
	*/
	disclosure(node, mode = 'toggle') {
		// check the current state
		let expanded = node.getAttribute('aria-expanded');
		expanded = expanded == 'true' ? true : false;

		// update the state
		const state = mode === 'toggle' ? !expanded : false;

		// Get the two nodes involved
		const buttonTargetId = node.getAttribute('aria-controls');
		const buttonTarget = document.getElementById(buttonTargetId);
	
		// Display the state
		node.setAttribute('aria-expanded', state);
		buttonTarget.setAttribute('data-expanded', state);

		if (state === true && this.style === 'footer') {
			window.scrollBy(0, buttonTarget.getBoundingClientRect().height + 16)
		}
	}

	/**
	 * Add all the events necessary for the disclosure pattern
	 */
	disclosureInit() {
		const button = this.node.querySelector('[data-dk-badge-button]');
		if (!button) return;

		document.addEventListener("click", (event) => {
			if (event.target.closest('[data-dk-badge-button]')) {
				this.disclosure(button)
			} else if (!event.target.closest('[data-dk-badge]')) {
				this.disclosure(button, 'close')
			}
		});
		
		document.addEventListener("keydown", (event) => {
			const escapeKey = 27;
			if (event.keyCode === escapeKey) {
				this.disclosure(button, 'close')
			}
		});
		
		document.addEventListener("blur", (event) => {
			if(event.relatedTarget && !event.relatedTarget.closest('[data-dk-badge]')) {
				this.disclosure(button, 'close');
				}
		},true);
	}

	/**
	 * Init the badge
	 */
	init() {
		this.render();

		const observer = new PerformanceObserver((args) => {
			this.performanceObserverCallback.call(this, args)
		});

		this.disclosureInit();

		this.handleVisibilityChange();
		document.addEventListener("visibilitychange", (event) => {
			this.handleVisibilityChange.call(this, event)
		}, false);

		document.addEventListener('dkBadge:calculated', (data) => {
			this.update.call(this, data);
		});

		// wait a bit before doing anything 
		// to make sure we collect the most information on page load
		setTimeout(() => {
			this.deviceType = this.getUserDevice();
			this.getStoredData();
			this.getResources();
			observer.observe({entryTypes: ['resource', 'navigation']});
		}, 500);
	}
}