let Org = require('../org/org');
let parser = require('../org/org_parser');
import {
  expect
} from 'chai';
let Immutable = require('immutable');
let {
  List,
  Set
} = Immutable;

let doc_headlines = "* 1\n** 1.1\n** 1.2\n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1";
let doc_just_headlines = "** 1\n*** 2\n* 3\n";
let doc_tags = "* TODO [#A] 1 :tag:tag2:";
let doc_scheduled = "* test\nSCHEDULED: <2016-06-01 Wed +1w> DEADLINE: <2016-06-02 Thu 8:00>\n";
let doc_timestamps = "* TODO 1\n** DONE 1.1\nSCHEDULED: <2016-09-01 Wed +1w> DEADLINE: <2016-06-02 Thu 8:00>\n*** TODO 1.1.1\n* 2\nDEADLINE: <2016-07-10 Fri> SCHEDULED: <2016-06-05 Fri>\n* TODO 3\n* DONE 4";
let doc_timestamps_reformatted = "* TODO 1\n** DONE 1.1\nSCHEDULED: <2016-09-01 Wed +1w> DEADLINE: <2016-06-02 Thu 8:00>\n*** TODO 1.1.1\n* 2\nSCHEDULED: <2016-06-05 Fri> DEADLINE: <2016-07-10 Fri>\n* TODO 3\n* DONE 4";
let doc_with_sections = "* 1\nlots of stuff\n going on \n in these sections** 1.1\n** 1.2\nso many great notes \n*** 1.2.1\n*** 1.2.2\n** 1.3\n* 2\n** 2.1";

// Large test doc used to test UI so far
let doc_large = "* DONE [#A] 1. I did this :project:\nSCHEDULED: <2016-06-05 Sun>\n:LOGBOOK:\nCLOCK: [2016-06-03 Fri 18:00]--[2016-06-03 Fri 19:30] =>  1:30\n- I did MORE of it\nCLOCK: [2016-06-02 Thu 18:00]--[2016-06-02 Thu 19:00] =>  1:00\n- I did part of it!\n:END:\n** 1.1 Look at all\n** 1.2 Of these headlines\n*** 1.2.1 Wow such hierarchy\n**** TODO 1.2.1.1 much test\n* 2. Work                                                              :work:\n** TODO [#A] 2.1 Do this or you lose your job!\nSCHEDULED: <2016-06-04 Sat> DEADLINE: <2016-06-06 Mon>\n*** 2.1.1 You should probably\n** TODO 2.2 so many things to do\n** TODO 2.3 and so little time\nSCHEDULED: <2016-06-06 Mon>\n** TODO 2.4 to do them all\n** DONE 2.5 Except this one. You did this one.\n** DONE 2.6 important tasks\nCLOSED: [2016-06-03 Fri 14:59]\n* 3. Home :home:\n** TODO 3.1 Remember garbage day?\nSCHEDULED: <2016-06-16 Thu +1w>\n:PROPERTIES:\n:LAST_REPEAT: [2016-06-03 Fri 21:32]\n:END:\n:LOGBOOK:\n- State \"DONE\"       from \"TODO\"       [2016-06-03 Fri 21:32]\n:END:\n** TODO 3.2 You should go to that thing\nSCHEDULED: <2016-06-13 Mon 20:00>\n*** DONE 3.2.1 Wow go buy some gifts or something \nDEADLINE: <2016-06-12 Sun> CLOSED: [2016-06-11 Sat 21:33]\n* 4. hobbies\n** 4.1 hobby #1\n*** TODO 4.1.1 Things and stuff hobby #1\n** 4.2 hobby #2\n*** TODO 4.2.1 Things and stuff hobby #2\n** 4.3 hobby #3\n*** TODO 4.3.1 Things and stuff hobby #3\n** 4.4 hobby #4\n*** TODO 4.4.1 Things and stuff hobby #4\n**** TODO this one has lots of nesting\n***** TODO and many children\n***** TODO to make the tree traversal complex\n***** TODO Although not all tasks are TODO here\n***** DONE Like this one.  This one is done";

function node(type, content, children = List()) {
  return {
    type: type,
    content: content,
    children: List(children)
  };
}

// Do a recursive comparison
function checkStructure(expected, actual) {
  if (expected.type !== undefined && expected.content !== undefined) {
    expect(actual.type).to.equal(expected.type);
    expect(actual.content).to.equal(expected.content);
    checkStructure(expected.children, actual.children);
  } else {
    let i = 0;
    for (let part of expected) {
      checkStructure(part, actual.get(i));
      i++;
    }
  }
}

describe('utils', () => {

  it('node level', () => {
    let l1 = Org.headlineNode(1, "1");
    expect(Org.level(Org.headlineNode(1, "1"))).to.equal(1);
    expect(Org.level(Org.headlineNode(100, "100"))).to.equal(100);

    expect(Org.level(Org.createDoc())).to.equal(0);
    expect(Org.level(Org.sectionNode("it has stuff"))).to.equal(Infinity);
  });

  it('iterates in order', () => {
    let doc = parser.parse(doc_headlines);
    let order = [null, '1', '1.1', '1.2', '1.2.1', '1.2.2', '1.3', '2', '2.1'];
    let traversed = [];
    while (doc != undefined) {
      traversed.push(doc.content);
      doc = Org.next(doc);
    }
    expect(traversed).to.deep.equal(order);
  });
});

describe('inserting', () => {
  describe('header', () => {
    it('at root', () => {
      let h1 = Org.headlineNode(1, 1);
      let h2 = Org.headlineNode(2, 2);
      let h3 = Org.headlineNode(1, 3);
      let h1_c = Org.insertHeadline(Org.createDoc(), h1);
      let h2_c = Org.insertHeadline(h1_c, h2);
      let h3_c = Org.insertHeadline(h2_c, h3);
      let h = Org.TYPES.headline;
      checkStructure(
        [node(h, 1, [
          node(h, 2)
        ]),
         node(h, 3)
        ],
        Org.getDoc(h3_c).children
      );
    });
  });
});

describe('parser', () => {
  it('can parse just headlines', () => {
    let h = Org.TYPES.headline;
    let doc = parser.parse(doc_just_headlines);
    checkStructure(
      [node(h, '1', [
        node(h, '2')
      ]),
       node(h, '3')
      ],
      doc.children
    );
  });

  it('headline tags, priority, and keywords parse', () => {
    let doc = parser.parse(doc_tags);
    let headline = doc.children.get(0);
    expect(Org.getMeta(headline, 'priority')).to.equal('A');
    expect(Org.getMeta(headline, 'keyword')).to.equal('TODO');
    expect(Org.getMeta(headline, 'tags').deref()).to.equal(Set(['tag', 'tag2']));
  });

  describe('timestamps', () => {
    // TODO: Generate parser that can start from ts and test timestamps individually
    it('parses scheduled and deadline', () => {
      let doc = parser.parse(doc_scheduled);
      expect(doc.getIn(['children', 0, 'meta', 'planning']).deref()).to.equal(Immutable.fromJS(
        {
          "SCHEDULED":
          {
            "active": true,
            "year": "2016",
            "month": "06",
            "day": "01",
            "hour": null,
            "minute": null,
            "dayname": "Wed",
            "repeater": {
              "mark": "+",
              "value": "1",
              "unit": "w"
            }
          },
          "DEADLINE":
          {
            "active": true,
            "year": "2016",
            "month": "06",
            "day": "02",
            "hour": "8",
            "minute": "00",
            "dayname": "Thu",
            "repeater": null
          }
        }
      ));
    });
  });
});

describe('search and sort', () => {
  let doc = parser.parse(doc_timestamps);
  let getContents = (nodes) => nodes.map((node) => { return Org.getContent(node); });
  describe('search', () => {
    // TODO: Test all operators
    describe('timestamps', () => {
      it('can search by schedule gte', () => {
        let found = Org.search(doc, 's.gte.2016-07-03');
        expect(getContents(found)).to.eql(['1.1'])
      });

      it('can search by schedule lte', () => {
        let found = Org.search(doc, 's.lte.2016-06-10 s.neq.none');
        expect(getContents(found)).to.eql(['2'])
      });
    });

    describe('keywords', () => {
      it('DONE', () => {
        let found = Org.search(doc, 'k.eq.DONE');
        expect(getContents(found)).to.eql(['1.1', '4']);
      });
      it('TODO', () => {
        let found = Org.search(doc, 'k.eq.TODO');
        expect(getContents(found)).to.eql(['1', '1.1.1', '3']);
      });
    });
  });

  describe('sort', () => {
    it('can sort by scheduled', () => {
      let found = Org.search(doc, 's.neq.none');
      let sorted = Org.sort(found, 's');
      expect(getContents(sorted)).to.eql(['2', '1.1']);
    });
  });
});

describe('export', () => {
  let test_export = (string) => {
    parsed = parser.parse(string);
    exported = Org.export_subtree(parsed);
    expect(exported).to.eql(string.trim());
  };

  let test_reformat = (string, out_string) => {
    parsed = parser.parse(string);
    exported = Org.export_subtree(parsed);
    expect(exported).to.eql(out_string);
  };

  it('can export headlines', () => {
    // test_export(doc_headlines);
    test_export(doc_just_headlines);
  });
  it('can export tags', () => {
    test_export(doc_tags);
  });
  it('can export timestamps', () => {
    test_export(doc_scheduled);
    test_reformat(doc_timestamps, doc_timestamps_reformatted);
  });
  it('can export sections', () => {
    test_export(doc_with_sections);
  });
  it('can export large doc ', () => {
    test_export(doc_large);
  });
});
