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
export function _select (selector, parent) {
  return (parent ? parent : document).querySelector(selector);
}

/**
 * Helper fonction for querySelectorAll()
 * @source https://gomakethings.com/an-easier-way-to-get-elements-in-the-dom-with-vanilla-js/
 * @param {string} selector - String query to look for
 * @param {node} [parent=document] - Optional parent of the query
 * @returns {node[]} Array of DOM Elements queried
 */
export function _selectAll (selector, parent) {
  return Array.prototype.slice.call((parent ? parent : document).querySelectorAll(selector));
};

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
export function disclosure(node, mode = 'toggle') {  
  const button = node.closest('[data-toggle-wrapper]') ? node : false; // get the node involved
  if (!button) return;

  // check the current state
  let expanded = button.getAttribute('aria-expanded');
  expanded = expanded == 'true' ? true : false;
  let buttonGroup = button.closest('data-toggle-wrapper') || document;

  // Reset any previous deployed element within the group
  _selectAll(`[data-toggle-button]`, buttonGroup).forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  })
  _selectAll(`[data-toggle-content]`, buttonGroup).forEach(content => {
    content.setAttribute('data-expanded', 'false');
  })

  if (mode === 'close') return; //if we want to close everything let il as-is

  // Get the two nodes involved
  const buttonTargetId = button.getAttribute('aria-controls');
  const buttonTarget = document.getElementById(buttonTargetId);

  // reverse it
  button.setAttribute('aria-expanded', !expanded);
  buttonTarget.setAttribute('data-expanded', !expanded);
}