import { disclosure } from "./disclosure";

class DKBadge {
	/**
	 * @copyright Diploïde, all rights reserved
	 */
	#factors = {
		// server
		"server_lifecycle": 0.023,
		"server_bandwidth": 125000,
		"france_server_efficiency": 6.69e-08,
		"international_server_efficiency": 7.10E-12,
		"france_electricity_carbon_intensity": 0.052,
		"world_electricity_carbon_intensity": 0.357,
		"europe_electricity_carbon_intensity": 0.2307,
		"server_pue": 1.69,
	
		// network
		"network_lifecycle_impact": 4.78e-09,
		"wifi_consumption": 4.13e-12,
		"g4_consumption": 1.11e-11,
		"server_country_network_ratio": 0.55,
		"viewing_country_network_ratio": 0.45,
	
		// device
		"mobile_acv_emissions": 84,
		"desktop_acv_emissions": 175,
		"tablette_acv_emissions": 75.9,
		"mobile_lifespan": 8869500,
		"desktop_lifespan": 13271400,
		"tablette_lifespan": 592200,
		"mobile_power": 0.00285,
		"desktop_power": 0.0294,
		"tablette_power": 0.0294
	};

	constructor(options = {}) {
		// Combine user options with defaults
    let {style, renderUI, pue, labels} = Object.assign({
			style: "full",
			renderUI: true,
			pue: 1.69,
			labels: {
				"intro": "This website has a carbon footprint of",
				"details": "Details",
				"weight": "Weight",
				"time": "Time",
				"device": "Device",
				"unknown": "unknown",
				"CO2unit": "g CO2e",
				"weightUnit": "Ko",
				"timeUnit": "sec."	
			}
		}, options);

		this.node = document.querySelector('[data-dk-badge]');
		this.style = style;
		this.pue = pue;
		this.renderUI = renderUI;
		this.labels = labels;
		this.totalSize = 0;
		this.timeSpent = 0;
		this.deviceType = 'desktop';
		this.ges = 0;
		this.timeIntervalId = null;
	}

	debug() {
		console.log(this);
	}

	render() {
		if (!this.renderUI) return;
		if (!this.node) return;

		const template = `
			<div class="dk-badge">
				<p class="dk-badge_title">
					${this.labels.intro}
					<span class="dk-badge_co2" data-dk-badge-CO2>${this.labels.unknown}</span>
				</p>
				<button class="dk-badge_button" aria-controls="dk-badge" aria-expanded="false" data-toggle-button>
					<svg xmlns='http://www.w3.org/2000/svg' viewBox="-2 -2 20 20" fill='none' stroke='#fff' stroke-linecap='round' stroke-width='2'>
						<path d="M-2 8h20"/>
						<path d="M-2 8h20" class="v"/>
					</svg>
					<span class="sr-only">${this.labels.details}</span>
				</button>
				<div class="dk-badge_content" data-toggle-content id="dk-badge">
					<hr class="dk-badge_hr" role="presentation">
					<p class="dk-badge_data">${this.labels.weight}&nbsp;: <strong data-dk-badge-weight>${this.labels.unknown}</strong></p>
					<p class="dk-badge_data">${this.labels.time}&nbsp;: <strong data-dk-badge-time>${this.labels.unknown}</strong></p>
					<p class="dk-badge_data">${this.labels.device}&nbsp;: <strong data-dk-badge-device>${this.labels.unknown}</strong></p>
					<hr class="dk-badge_hr" role="presentation">
					<p class="dk-badge_data">Powered by DK</p>
				</div>
			</div>`;
		this.node.innerHTML = template;
	}

	/**
	 * Check if the device is a mobile or tablet device
	 * Note: this is not a perfect solution, but it's simple and good enough for our needs
	 * @source https://tutorial.eyehunts.com/js/javascript-detect-mobile-or-tablet-html-example-code/
	 * @returns {string} "mobile", "tablet" or "desktop"
	 */
	getUserDevice() {
		const userAgent = navigator.userAgent.toLowerCase();
		const isMobile = /iphone|android/.test(userAgent) ? 'Mobile' : false;
		const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent) ? 'Tablet' : false;

		return isMobile || isTablet || 'Desktop';
	}

	getStoredData() {
		let storedData = sessionStorage.getItem('dk-badge');
		if (storedData) {
			storedData = JSON.parse(storedData);
			this.timeSpent = storedData.timeSpent;
			this.totalSize = storedData.totalSize;
		}
	}

	storeData() {
		sessionStorage.setItem('dk-badge', JSON.stringify({
			"timeSpent": this.timeSpent,
			"totalSize": this.totalSize
		}));
	}

	calculate(size, time, deviceType) {
		const sizeinKo = size / 1000;
		const averages = {
			"france_server_proportion": 0.50,
			"international_server_proportion": 0.50,
			"wifi_proportion": 0.50,
			"g4_proportion": 0.50,
			"mobile_proportion": deviceType === "Mobile" ? 1 : 0,
			"desktop_proportion": deviceType === "Desktop" ? 1 : 0,
			"tablette_proportion": deviceType === "Tablet" ? 1 : 0,
			"audience_location_france": 1,
			"audience_location_europe": 0,
			"audience_location_international": 0
		};
		// the average version first
		const storage = {
			acv: (sizeinKo / this.#factors.server_bandwidth) * (this.#factors.server_lifecycle / 1000),
			usage:
				(averages.france_server_proportion *
					this.#factors.france_server_efficiency *
					this.#factors.france_electricity_carbon_intensity +
					averages.international_server_proportion *
						this.#factors.international_server_efficiency *
						this.#factors.world_electricity_carbon_intensity) *
				this.#factors.server_pue *
				(sizeinKo * 1000),
		};
	
		const network = {
			acv: this.#factors.network_lifecycle_impact * sizeinKo,
			usage:
				sizeinKo *
				8000 *
				(this.#factors.wifi_consumption * averages.wifi_proportion +
					this.#factors.g4_consumption * averages.g4_proportion) *
				(this.#factors.server_country_network_ratio *
					(averages.france_server_proportion *
						this.#factors.france_electricity_carbon_intensity +
						averages.international_server_proportion *
							this.#factors.world_electricity_carbon_intensity) +
					this.#factors.viewing_country_network_ratio *
						(averages.audience_location_france *
							this.#factors.france_electricity_carbon_intensity +
							averages.audience_location_europe *
								this.#factors.europe_electricity_carbon_intensity +
							averages.audience_location_international *
								this.#factors.world_electricity_carbon_intensity)),
		};
	
		const device = {
			acv:
				time *
				((this.#factors.mobile_acv_emissions * averages.mobile_proportion) /
					this.#factors.mobile_lifespan +
					(this.#factors.desktop_acv_emissions * averages.desktop_proportion) /
						this.#factors.desktop_lifespan +
					(this.#factors.tablette_acv_emissions * averages.tablette_proportion) /
						this.#factors.tablette_lifespan),
			usage:
				(time / 3600) *
				(this.#factors.mobile_power * averages.mobile_proportion +
					this.#factors.desktop_power * averages.desktop_proportion +
					this.#factors.tablette_power * averages.tablette_proportion) *
				(averages.audience_location_france *
					this.#factors.france_electricity_carbon_intensity +
					averages.audience_location_europe *
						this.#factors.europe_electricity_carbon_intensity +
					averages.audience_location_international *
						this.#factors.world_electricity_carbon_intensity),
		};
	
		// Add everything & convert in grams
		const total = (storage.acv+storage.usage+network.acv+network.usage+device.acv+device.usage) * 1000;
	
		return total;
	}

	/**
	 * Update the value of a dk-badge element
	 * @param {string} key - [data-dk-badge-${key}]
	 * @param {string} value
	 * @private
	 */
	#updateElement(key, value) {
		if (!this.renderUI) return;
		const node = this.node.querySelector(`[data-dk-badge-${key}]`);
		if (!node) return;
		node.innerHTML = value;
	}

	update(ges, size, time, device) {
		if (!this.renderUI) return;
		var values = [
			{
				"key": "CO2",
				"value": ges.toFixed(2) + ' ' + this.labels.CO2unit
			},
			{
				"key": "time",
				"value": time + ' ' + this.labels.timeUnit
			},
			{
				"key": "device",
				"value": device
			},
			{
				"key": "weight",
				"value": (size / 1000).toFixed(2) + ' ' + this.labels.weightUnit
			}
		];
		values.forEach((value) => {
			this.#updateElement(value.key, value.value);
		});
	}

	getResources(list = performance.getEntries()) {
		if (!list) return;
		if (list.length !== 0) {
			list.forEach((entry, index) => {
				// do something with the entries
				// console.log("== Resource[" + index + "] - " + entry.name);
				if ("transferSize" in entry) {
					this.totalSize = this.totalSize + entry.transferSize
					// TODO: log if debug
					// console.log("transferSize[" + index + "] = " + entry.transferSize);
				}
			});
		}	
		this.ges = this.calculate(this.totalSize, this.timeSpent, this.deviceType);

		// TODO: Emit an event and use it to update the result
		this.update(this.ges, this.totalSize, this.timeSpent, this.deviceType);
	}

	perfObserver(list, observer, droppedEntriesCount) {
		this.getResources(list.getEntries());
		if (droppedEntriesCount > 0) {
			console.warn(
				`${droppedEntriesCount} entries got dropped due to the buffer being full.`,
			);
		}
	}

	updateInterval() {
		return setInterval(() => {
			this.timeSpent += 1; // 1 seconds
			this.storeData();
	
			// Update the badge every 5 seconds (to avoid performance issues)
			// the gap is not that big with only seconds updating
			// the performance observer handles when significant changes happen
			if (this.timeSpent % 5 === 0) {
				this.getResources([]);
			} else {
				this.#updateElement('time', this.timeSpent + ' ' + this.labels.timeUnit);
			}
		}, 1000);	
	};

	// The process update only when the tab is visible
	// it avoids using performances for nothing & it's more accurate for computing
	handleVisibilityChange(){
		if (document.hidden) {
			// console.log( 'tab became hidden, clearing' );
			clearInterval(this.updateIntervalId)
			this.updateIntervalId = null;
		} else {
			// console.log( 'tab became visible, restarting' );
			this.updateIntervalId = this.updateIntervalId || this.updateInterval();
		}
	}

	init() {
		this.render();
		// TODO : Make a version without rendenring the badge & emit an event each time there is an update of computing.
		const observer = new PerformanceObserver((args) => {this.perfObserver.call(this, args)});
		this.handleVisibilityChange();
		document.addEventListener("visibilitychange", (event) => {this.handleVisibilityChange.call(this, event)}, false);

		// wait a bit before doing anything 
		// to make sure we collect the most information on page load
		setTimeout(() => {
			// check if the device is a mobile device
			this.deviceType = this.getUserDevice();
			this.getStoredData();
			this.getResources();
			observer.observe({entryTypes: ['resource', 'navigation']});
			
		}, 500);
	}
}

document.addEventListener("click", (event) => {
  if (event.target.closest('[data-toggle-button]')) {
    disclosure(event.target.closest('[data-toggle-button]'))
  } else if (!event.target.closest('[data-toggle-wrapper]')) {   
    // Reset any previous deployed disclosure element
    const disclosureButtons = document.querySelectorAll(`[data-toggle-button]`);
    const disclosureContent = document.querySelectorAll(`[data-toggle-content]`);
    if (disclosureButtons) {
      disclosureButtons.forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      })
    }
    if (disclosureContent) {
      disclosureContent.forEach(content => {
        content.setAttribute('data-expanded', 'false');
      })
    }
  }
});


document.addEventListener("keydown", (event) => {
  const escapeKey = 27;
  if (event.keyCode === escapeKey) {
    disclosure(event.target, 'close')
  }
});

document.addEventListener("blur", (event) => {
  if(event.relatedTarget && !event.relatedTarget.closest('[data-toggle-wrapper]')) {
      disclosure(event.target, 'close');
    }
},true);