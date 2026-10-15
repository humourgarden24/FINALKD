export const monuments = [
  {
    id:'taj', name:'Taj Mahal', location:'Agra, Uttar Pradesh', era:'Mughal architecture', period:'1632–1648',
    source:'https://whc.unesco.org/en/list/252/',
    summary:'Commissioned by Shah Jahan in memory of Mumtaz Mahal, this white-marble mausoleum stands in Agra beside the Yamuna.',
    hotspots:[
      {id:'dome',title:'The central dome',position:[0,5.5,0],text:'A large dome crowns the mausoleum. Notice how the smaller domed pavilions balance the central form. The model simplifies the building’s proportions.'},
      {id:'minaret',title:'Four minarets',position:[3.7,3.8,3.7],text:'Four minarets stand at the corners of the raised platform. Orbit the model and compare their placement around the central mausoleum.'},
      {id:'garden',title:'Garden and symmetry',position:[-2,.35,7],text:'The formal garden uses intersecting paths and water features. Compare the left and right sides to see the role of symmetry in the overall design.'}
    ],
    timeline:[['1632','Construction began under Shah Jahan.'],['1648','The principal mausoleum was completed; work on the wider complex continued.'],['1983','Inscribed on the UNESCO World Heritage List.']],
    quiz:[
      {question:'Who commissioned the Taj Mahal?',options:['Shah Jahan','Ashoka','Akbar'],answer:0,why:'Shah Jahan commissioned it in memory of Mumtaz Mahal.'},
      {question:'Where are the four minarets positioned?',options:['Inside the dome','At the corners of the platform','In the centre of the garden'],answer:1,why:'The minarets frame the mausoleum at the platform’s corners.'}
    ]
  },
  {
    id:'qutub',name:'Qutub Minar',location:'Delhi',era:'Delhi Sultanate',period:'Late 12th century onward',
    source:'https://whc.unesco.org/en/list/233/',
    summary:'The Qutb complex contains a tall tapering minaret and monuments from the early Delhi Sultanate.',
    hotspots:[
      {id:'tower',title:'A tapering tower',position:[.8,6,0],text:'The tower narrows as it rises. Move around the model to examine its vertical form.'},
      {id:'balcony',title:'Projecting balconies',position:[1.15,3.5,0],text:'Balconies mark the storeys. They divide the tall structure into distinct visual sections.'},
      {id:'base',title:'The surrounding complex',position:[-2,.4,2],text:'The minaret belongs to a larger historic complex. This first model shows only a simplified tower and platform.'}
    ],
    timeline:[['Late 12th century','Construction began during the early Delhi Sultanate.'],['13th century','Successors extended the minaret.'],['1993','The Qutb complex entered the UNESCO World Heritage List.']],
    quiz:[
      {question:'Which city contains the Qutb complex?',options:['Agra','Jaipur','Delhi'],answer:2,why:'The Qutb complex is in Delhi.'},
      {question:'How does the tower’s width change upward?',options:['It narrows','It gets wider','It stays square'],answer:0,why:'The minaret tapers as it rises.'}
    ]
  },
  {
    id:'fort',name:'Red Fort',location:'Delhi',era:'Mughal architecture',period:'17th century',
    source:'https://whc.unesco.org/en/list/231/',
    summary:'Built as the palace fort of Shahjahanabad under Shah Jahan, the Red Fort combines defensive walls with palace spaces.',
    hotspots:[
      {id:'gate',title:'A monumental entrance',position:[0,3,3.25],text:'An imposing gateway introduces the palace fort. Compare the scale of the entrance with the enclosing walls in this simplified model.'},
      {id:'walls',title:'Red sandstone walls',position:[-4,1.8,3],text:'The massive red sandstone walls give the fort its name and define its outer boundary.'},
      {id:'palace',title:'Palace pavilions',position:[0,2,-1],text:'Inside the fort, palace pavilions were connected by a water channel called Nahr-i-Behisht, the Stream of Paradise.'}
    ],
    timeline:[['17th century','Shah Jahan established the palace fort for his new capital.'],['Later period','British military occupation altered parts of the complex.'],['2007','The Red Fort Complex entered the UNESCO World Heritage List.']],
    quiz:[
      {question:'Which material gives the fort its name?',options:['White marble','Red sandstone','Blue tile'],answer:1,why:'The enclosing red sandstone walls give the Red Fort its name.'},
      {question:'The Red Fort was built as…',options:['A lighthouse','A stepwell','A palace fort'],answer:2,why:'It was the palace fort of Shahjahanabad.'}
    ]
  }
];
