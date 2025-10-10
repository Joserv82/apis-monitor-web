async function fetchStatus(){
    try{
        const res = await fetch('/api/status?_=' + Date.now());
        const data = await res.json();
        renderHeatmap(data);
    }catch (e){
        console.error("Error al obtener estado de las APIs:", e);
    }
}

function renderHeatmap(data){
    const container =document.getElementById('heatmap');
    container.innerHTML='';

    data.forEach(api =>{
        const div = document.createElement('div');
        div.className = `api-box ${api.status || 'unknow'}`;
        //` estas se ponen con alt + 96
        div.textContent =api.name;
        container.appendChild(div);
    });
}
setInterval(fetchStatus, 5000); //Esto lo refresca cada 5 seg.
fetchStatus();
        