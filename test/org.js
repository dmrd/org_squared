var org = require('../org/org');
import {expect} from 'chai';


function pprint(object) {
  console.log(JSON.stringify(object, null, 2))
}

describe('utils', () => {

  it('node level', () => {
    var l1 = org.headlineNode(1, "1");
    expect(org.level(org.headlineNode(1, "1"))).to.equal(1)
    expect(org.level(org.headlineNode(100, "100"))).to.equal(100)

    expect(org.level(org.docNode())).to.equal(0)
    expect(org.level(org.sectionNode("it has stuff"))).to.equal(Infinity)
  });
});

describe('inserting', () => {
  describe('header', () => {
    it('at root', () => {
      var doc = new
      org.Document;
      var root = doc.getRoot();
      var h1 = org.headlineNode(1, 1);
      var h2 = org.headlineNode(2, 2);
      var h3 = org.headlineNode(1, 3);
      var h1_c = org.insertHeadline(doc, root, h1);
      var h2_c = org.insertHeadline(doc, h1_c, h2);
      var h3_c = org.insertHeadline(doc, h2_c, h3);
      root = doc.getRoot();
      pprint(root)
      expect(root.children.size).to.equal(2)
      expect(root.children.get(0).content).to.equal(1)
      expect(root.children.get(1).content).to.equal(3)
      expect(root.children.get(0).children.get(0).content).to.equal(2)
    });
  });
});
