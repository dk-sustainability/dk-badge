(function () {
  'use strict';

  /**
   * Helper fonction for querySelector()
   * @source https://gomakethings.com/an-easier-way-to-get-elements-in-the-dom-with-vanilla-js/
   * @param {string} selector - String query to look for
   * @param {node} [parent=document] - Optional parent of the query
   * @returns {node} DOM Element queried
   * @example
   *   const nodeParent = _select('.my-element');
   *   const node = _select('.my-child-element', nodeParent);
   */

  /**
   * Helper fonction for querySelectorAll()
   * @source https://gomakethings.com/an-easier-way-to-get-elements-in-the-dom-with-vanilla-js/
   * @param {string} selector - String query to look for
   * @param {node} [parent=document] - Optional parent of the query
   * @returns {node[]} Array of DOM Elements queried
   */
  function _selectAll (selector, parent) {
    return Array.prototype.slice.call((parent ? parent : document).querySelectorAll(selector));
  }
  /**
   * An implementation of the disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
   * @author Rachel Pellin <pellin.rachel@gmail.com>
   * @param {node} node The button toggle
   * @param {string} mode toggle or close to force close on blur & escape
   * @example
   *  <nav data-toggle-wrapper>
        <button aria-controls="submenu-1" aria-expanded="false" data-toggle-button>bouton</button>
        <ul id="submenu-1" data-toggle-content>
          ...
        </ul>
      </nav>
   */
  function disclosure(node, mode = 'toggle') {  
    const button = node.closest('[data-toggle-wrapper]') ? node : false; // get the node involved
    if (!button) return;

    // check the current state
    let expanded = button.getAttribute('aria-expanded');
    expanded = expanded == 'true' ? true : false;
    let buttonGroup = button.closest('data-toggle-wrapper') || document;

    // Reset any previous deployed element within the group
    _selectAll(`[data-toggle-button]`, buttonGroup).forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
    _selectAll(`[data-toggle-content]`, buttonGroup).forEach(content => {
      content.setAttribute('data-expanded', 'false');
    });

    if (mode === 'close') return; //if we want to close everything let il as-is

    // Get the two nodes involved
    const buttonTargetId = button.getAttribute('aria-controls');
    const buttonTarget = document.getElementById(buttonTargetId);

    // reverse it
    button.setAttribute('aria-expanded', !expanded);
    buttonTarget.setAttribute('data-expanded', !expanded);
  }

  const DKBadgeWrapper = document.querySelector('[data-dk-badge]');

  /**
   * @copyright Diploïde, all rights reserved
   */
  const factors = {
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

  function calculateDKBadge(size, time, deviceType) {
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
      acv: (sizeinKo / factors.server_bandwidth) * (factors.server_lifecycle / 1000),
      usage:
        (averages.france_server_proportion *
          factors.france_server_efficiency *
          factors.france_electricity_carbon_intensity +
          averages.international_server_proportion *
            factors.international_server_efficiency *
            factors.world_electricity_carbon_intensity) *
        factors.server_pue *
        (sizeinKo * 1000),
    };

    const network = {
      acv: factors.network_lifecycle_impact * sizeinKo,
      usage:
        sizeinKo *
        8000 *
        (factors.wifi_consumption * averages.wifi_proportion +
          factors.g4_consumption * averages.g4_proportion) *
        (factors.server_country_network_ratio *
          (averages.france_server_proportion *
            factors.france_electricity_carbon_intensity +
            averages.international_server_proportion *
              factors.world_electricity_carbon_intensity) +
          factors.viewing_country_network_ratio *
            (averages.audience_location_france *
              factors.france_electricity_carbon_intensity +
              averages.audience_location_europe *
                factors.europe_electricity_carbon_intensity +
              averages.audience_location_international *
                factors.world_electricity_carbon_intensity)),
    };

    const device = {
      acv:
        time *
        ((factors.mobile_acv_emissions * averages.mobile_proportion) /
          factors.mobile_lifespan +
          (factors.desktop_acv_emissions * averages.desktop_proportion) /
            factors.desktop_lifespan +
          (factors.tablette_acv_emissions * averages.tablette_proportion) /
            factors.tablette_lifespan),
      usage:
        (time / 3600) *
        (factors.mobile_power * averages.mobile_proportion +
          factors.desktop_power * averages.desktop_proportion +
          factors.tablette_power * averages.tablette_proportion) *
        (averages.audience_location_france *
          factors.france_electricity_carbon_intensity +
          averages.audience_location_europe *
            factors.europe_electricity_carbon_intensity +
          averages.audience_location_international *
            factors.world_electricity_carbon_intensity),
    };

  	// Add everything & convert in grams
  	const total = (storage.acv+storage.usage+network.acv+network.usage+device.acv+device.usage) * 1000;

  	// console.trace(total, 'g CO2e');

  	return total;
  }

  /**
   * Update the value of a dk-badge element
   * @param {string} key - [data-dk-badge-${key}]
   * @param {string} value
   */
  function renderElement(key, value) {
  	const node = DKBadgeWrapper.querySelector(`[data-dk-badge-${key}]`);
  	if (!node) return;
  	node.innerHTML = value;
  }

  // Donne le dk-badge
  function DKBadge (ges, size, time, device) {
  	var values = [
  		{
  			"key": "CO2",
  			"value": ges.toFixed(2) + 'g CO2e'
  		},
  		{
  			"key": "time",
  			"value": time + ' sec.'
  		},
  		{
  			"key": "device",
  			"value": device
  		},
  		{
  			"key": "weight",
  			"value": (size / 1000).toFixed(2) + ' Ko'
  		}
  	];
  	values.forEach((value) => {
  		renderElement(value.key, value.value);
  	});
  }

  let totalSize = 0;
  let timeSpent = 0;
  let deviceType = 'desktop';

  /**
   * Check if the device is a mobile or tablet device
   * Note: this is not a perfect solution, but it's simple and good enough for our needs
   * @source https://tutorial.eyehunts.com/js/javascript-detect-mobile-or-tablet-html-example-code/
   * @returns {string} "mobile", "tablet" or "desktop"
   */
  function getUserDevice() {
  	const userAgent = navigator.userAgent.toLowerCase();
  	const isMobile = /iphone|android/.test(userAgent) ? 'Mobile' : false;
  	const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent) ? 'Tablet' : false;

  	return isMobile || isTablet || 'Desktop';
  }

  function getStoredData() {
  	let storedData = sessionStorage.getItem('dk-badge');
  	if (storedData) {
  		storedData = JSON.parse(storedData);
  		timeSpent = storedData.timeSpent;
  		totalSize = storedData.totalSize;
  	}
  }

  function storeData() {
  	sessionStorage.setItem('dk-badge', JSON.stringify({
  		timeSpent,
  		totalSize
  	}));
  }

  function getResources(list = performance.getEntries()) {
    if (!list) return;
    if (list.length !== 0) {
  		list.forEach((entry, index) => {
  			// do something with the entries
  			// console.log("== Resource[" + index + "] - " + entry.name);
  			if ("transferSize" in entry) {
  				totalSize = totalSize + entry.transferSize;
  				// console.log("transferSize[" + index + "] = " + entry.transferSize);
  			}
  		});
  	}

  	const ges = calculateDKBadge(totalSize, timeSpent, deviceType);
  	// console.log(ges);
  	DKBadge(ges, totalSize, timeSpent, deviceType);
  }

  function perfObserver(list, observer, droppedEntriesCount) {
    getResources(list.getEntries());
    if (droppedEntriesCount > 0) {
      console.warn(
        `${droppedEntriesCount} entries got dropped due to the buffer being full.`,
      );
    }
  }
  const observer = new PerformanceObserver(perfObserver);


  let timeIntervalId = null;

  let timeInterval = function() {
    return setInterval(() => {
  		timeSpent += 1; // 1 seconds
  		storeData();

  		// Update the badge every 5 seconds (to avoid performance issues)
  		// the gap is not that big with only seconds updating
  		// the performance observer handles when significant changes happen
  		if (timeSpent % 5 === 0) {
  			getResources([]);
  		} else {
  			renderElement('time', timeSpent + ' sec.');
  		}
  	}, 1000);	
  };

  // The process update only when the tab is visible
  // it avoids using performances for nothing & it's more accurate for computing
  function handleVisibilityChange(){
    if (document.hidden) {
      // console.log( 'tab became hidden, clearing' );
      clearInterval(timeIntervalId);
      timeIntervalId = null;
    } else {
      // console.log( 'tab became visible, restarting' );
      timeIntervalId = timeIntervalId || timeInterval();
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange();

  document.addEventListener("DOMContentLoaded", function(event) {
  	// wait a bit before doing anything 
  	// to make sure we collect the most information on page load
  	setTimeout(() => {
  		// check if the device is a mobile device
  		deviceType = getUserDevice();
  		getStoredData();
  		getResources();
  		observer.observe({entryTypes: ['resource', 'navigation']});
  	}, 500);
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-toggle-button]')) {
      disclosure(event.target.closest('[data-toggle-button]'));
    } else if (!event.target.closest('[data-toggle-wrapper]')) {   
      // Reset any previous deployed disclosure element
      const disclosureButtons = _selectAll(`[data-toggle-button]`);
      const disclosureContent = _selectAll(`[data-toggle-content]`);
      if (disclosureButtons) {
        disclosureButtons.forEach(button => {
          button.setAttribute('aria-expanded', 'false');
        });
      }
      if (disclosureContent) {
        disclosureContent.forEach(content => {
          content.setAttribute('data-expanded', 'false');
        });
      }
    }
  });


  document.addEventListener("keydown", (event) => {
    const escapeKey = 27;
    if (event.keyCode === escapeKey) {
      disclosure(event.target, 'close');
    }
  });

  document.addEventListener("blur", (event) => {
    if(event.relatedTarget && !event.relatedTarget.closest('[data-toggle-wrapper]')) {
        disclosure(event.target, 'close');
      }
  },true);

}());
