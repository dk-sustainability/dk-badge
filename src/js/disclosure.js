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
  buttonGroup.querySelectorAll(`[data-toggle-button]`).forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  })
  buttonGroup.querySelectorAll(`[data-toggle-content]`).forEach(content => {
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