import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCaretRight,
  faArrowLeft,
  faCog,
  faStar,
  faSyncAlt,
  faPlay,
  faCheckCircle,
  faSearch,
  faTv,
  faBookmark,
  faCaretDown,
  faCaretUp,
} from '@fortawesome/free-solid-svg-icons';
import { faImdb } from '@fortawesome/free-brands-svg-icons';

library.add(faCaretRight);
library.add(faArrowLeft);
library.add(faCog);
library.add(faStar);
library.add(faSyncAlt);
library.add(faPlay);
library.add(faImdb);
library.add(faCheckCircle);
library.add(faSearch);
library.add(faTv);
library.add(faBookmark);
library.add(faCaretDown);
library.add(faCaretUp);

export default FontAwesomeIcon;
