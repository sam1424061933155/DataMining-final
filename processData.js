function getData(){
    d3.text("PMOctVer2.csv", (function(data) { 
            var parsedCSV = d3.csv.parseRows(data);
            
            var a = parsedCSV.map(function(d){
                return{
                     town:d[4],
                     date:d[1],
                     time:d[2],
                     pm25:d[3]

                }
            });

    //整理data

        for(var i=0 ; i<a.length ;i++)
        {

            a[i].town = a[i].town.replace("台","臺");

            /* 篩掉一些詭異資料 */
            if(isNaN(parseInt(a[i].pm25))|| parseInt(a[i].pm25) < 0 || parseInt(a[i].pm25) > 100) continue;

            
            if (!((a[i].town) in Taiwan))
            {
                    
            var Time={};

            Time.acc=a[i].pm25;
            Time.count="1";

            var Date={};
            Date[a[i].time]=Time;

            var Town = {};
            Town[a[i].date]=Date;

            
            Taiwan[a[i].town]=Town;
                    

            }
            else
            {
                
                    
                if(!(a[i].date in Taiwan[a[i].town] ))
                {

                    var Time={};
                    Time.acc=a[i].pm25;
                    Time.count="1";

                    var Date={};
                    Date[a[i].time]=Time;
                    Taiwan[a[i].town][a[i].date]=Date;

                    
                }
                else
                {
                    if(!((a[i].time) in Taiwan[a[i].town][a[i].date]))
                    {
                        var Time={};
                        Time.acc=a[i].pm25;
                        Time.count="1";
                        Taiwan[a[i].town][a[i].date][a[i].time]=Time;
                    }
                    else
                    {
                        var index=parseFloat(Taiwan[a[i].town][a[i].date][a[i].time]['acc'])+parseFloat(a[i].pm25);
                        Taiwan[a[i].town][a[i].date][a[i].time]['acc']=index.toString();

                        var index_c=parseInt(Taiwan[a[i].town][a[i].date][a[i].time]['count'])+1;
                        Taiwan[a[i].town][a[i].date][a[i].time]['count']=index_c.toString();
                    }
                }
            }
     }

    /* 匿名函數最後才執行 , 須在內部調用接下來要run的東西 */
    calculatePerDay();
    startDrawingMap();
    imm_init();
    //imm_startDrawingMap();

    }));

}


function calculatePerDay()
{
    var sumPM25 , timeCount ,avgDate;

    /* city , date , time 各都是string */
    for(var city in Taiwan)
    {
       var Date = {};

       TargetArea.push(city);

       for(var date in Taiwan[city])
       {
            timeCount = 0 ;
            sumPM25 = 0 ;
            for(var time in Taiwan[city][date])
            {
                timeCount += 1 ;
                sumPM25 += parseInt(Taiwan[city][date][time]['acc'])/parseInt(Taiwan[city][date][time]['count']) ;
            }
            avgDate = sumPM25 / timeCount ;           
            Date[date] = avgDate.toFixed(2);
       }
       AreaAccPM25[city] = Date ;

    }

}

/* Global */
Taiwan = {};    // 各區各日期各時間之總資料表 .
AreaAccPM25 = {}; // 各區各日平均濃度 .
TargetArea = []; // 存放有資料的各城市名稱以及boundary .

/* Main */
getData();
//calculatePerDay();
console.log(AreaAccPM25);



