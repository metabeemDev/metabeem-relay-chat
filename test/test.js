import minimist from "minimist";
import _ from "lodash";

const argv = minimist( process.argv.slice( 2 ) );


console.log( argv );
console.log( _.isObject( argv ) );
