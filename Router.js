import {
  createRouter,
} from '@exponent/ex-navigation';

let OrgView = require('./OrgView.js');

export let Router = createRouter(() => ({
  outline: () => OrgView.OutlineView,
  edit_node: () => OrgView.EditView,
  search: () => OrgView.SearchView
}));
