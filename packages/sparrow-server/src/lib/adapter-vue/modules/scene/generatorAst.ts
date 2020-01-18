
import * as parser from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

let scriptStr = `
  import generatorMixin from '../mixins/generatorMixin';
  export default {
    mixins: [generatorMixin]
  };
`; 

const initScript = `
  export default {
    mixins: [],
    data () {
      return {};
    },
    components: {},
    methods: {}
  }
`;

let pageAST = parser.parse(scriptStr, {
  sourceType: 'module',
});

const scriptAst = parser.parse(initScript, {
  sourceType: 'module',
});

function getScriptValue (propName: string): any {
  let props = [];
  traverse(scriptAst, {
    ExportDefaultDeclaration ({node}) {
      props = node.declaration.properties;
    }
  });
  if (!props) return;
  const propNode = props.filter(item => {
    return item.key.name === propName;
  });
  return propNode[0];
}

function getAstByCode (code: string): any {
  return parser.parse(code, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
  });
}


function importStr (componentName: string) {
  return `import ${componentName} from './components/${componentName}'`;
}

export function getScript () {
  return pageAST;
}

export function setInitScript () {
  pageAST = parser.parse(scriptStr, {
    sourceType: 'module',
  });
}



export function appendComponent (componentName: string) {
  traverse(pageAST, {
    Program({ node }) {
      // import components
      traverse(getAstByCode(importStr(componentName)), {
        Program(path) {
          node.body.unshift(path.node.body[0]);
        }
      });
    },
    ObjectExpression (path) {
      if (path.parent.type === 'ExportDefaultDeclaration') {
        const {node} = path;
        let componentsNode = node.properties.find(item => item.key.name === 'components')
        if (!componentsNode) {
          componentsNode = getScriptValue('components');
          node.properties.unshift(componentsNode);
        }
        // vue components add component
        componentsNode.value.properties.push(
          t.objectProperty(t.identifier(componentName), t.identifier(componentName), false, true)
        );
        
      }
    }
  });
}


