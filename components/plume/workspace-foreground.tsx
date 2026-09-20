'use client';
import {useId} from 'react';

/** Reuse the frame's own paper edge above the cards, keeping its texture aligned. */
export function WorkspaceForeground(){
 const clip=useId().replaceAll(':','');
 return <svg className="workspace-foreground" viewBox="0 680 1672 261" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs><clipPath id={clip}><path d="M0 713 C35 704 47 736 80 755 C115 775 148 768 184 797 C209 784 228 806 259 800 C296 797 320 811 343 821 C369 838 370 851 411 858 C453 854 486 880 525 876 C559 865 585 870 611 884 L642 893 C683 879 715 862 750 873 C781 879 792 887 829 887 C875 886 899 904 940 905 C978 906 1007 932 1040 921 C1082 902 1094 886 1131 898 C1169 901 1194 902 1223 895 C1260 890 1281 888 1310 883 C1346 881 1366 889 1399 874 C1432 860 1453 862 1478 848 C1515 835 1533 815 1560 805 C1599 793 1611 769 1627 735 L1672 691 L1672 941 L0 941Z"/></clipPath></defs>
  <image href="/art/workspace-frame.png" width="1672" height="941" preserveAspectRatio="none" clipPath={`url(#${clip})`}/>
 </svg>;
}
