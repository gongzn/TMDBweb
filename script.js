const state={
    page: 1,
    totalPages: 0,
    cards: [],
    liked: [],
    movieDetail: {},
    modalOn: false,
    liked: [],
    likedPage: false,
}

const select = document.querySelector('select')
const apiKey = '4513190c99de11f7886a1c5ec0b7c629'
const imageUrl = 'https://image.tmdb.org/t/p/w500/'
const prevBtn = document.querySelector('.prev')
const nextBtn = document.querySelector('.next')
const cardsContainer = document.getElementById('movieCardsWrapper');
const homeBtn = document.querySelector('#home')
const likedBtn = document.querySelector('#liked')



prevBtn.addEventListener('click', ()=>{
    if (state.page > 1){
        state.page--;
        loadMovieData()
    }
})

nextBtn.addEventListener('click', ()=>{
    if (state.page !== state.totalPages){
        state.page++;
        loadMovieData()
    }
})

select.addEventListener('change', ()=>{
    state.page = 1
    loadMovieData()
})


const loadMovieData = ()=>{
    fetch(`https://api.themoviedb.org/3/movie/${select.value}?api_key=${apiKey}&language=en-US&page=${state.page}`)
    .then((resp)=>{
        return resp.json()
    }).then((data)=>{
        state.page = data.page;
        state.totalPages = data.total_pages;
        state.cards = data.results;

        renderView(state)
    })
}

const renderView = (state)=>{
    const cardsContainer = document.getElementById('movieCardsWrapper');
    cardsContainer.innerHTML=''

    if (state.likedPage === true){
        state.liked.forEach(movie => {
            cardsContainer.append(movie.value)
        });
    }else{
        showPages(state);

        state.cards.forEach((movie) => {
            const movieCard = buildMovieCard(movie)
            cardsContainer.append(movieCard)
        });

        const likedIdList = state.liked.map((likedMovie)=>likedMovie.id)
        if (likedIdList.length > 0){
            likedIdList.forEach((id)=>{
                const chosenLikeBtn = document.getElementById(`btn${id}`)
                chosenLikeBtn.className = 'likeBtn ion-ios-heart'
            })
        }

        if (state.modalOn){
            const modalWindow = buildDetailModal(state.movieDetail);
            cardsContainer.append(modalWindow)
        }
    }


}

const buildMovieCard = (item)=>{
    const cardBody = document.createElement('div')
    cardBody.className = 'movieCard';
    cardBody.id = item.id

    cardBody.innerHTML = `
    <img class="cardPoster" src="https://image.tmdb.org/t/p/w500/${item.poster_path}"/>
    <button class="cardTitle">${item.title}</button>
    <div class="cardInfo">
        <div class="ratingGroup">
            <i class="ion-star ratingIcon"></i>
            <p>${item.vote_average}</p>
        </div>
        <i id="btn${cardBody.id}" class="likeBtn ion-ios-heart-outline"></i>
    </div>
    `

    
    return cardBody
}

const handleCardsContainerClick = (event)=>{
    const movieCard = event.target.closest('.movieCard');
    if (movieCard){

        if (event.target.className === 'cardTitle') {
            loadMovieDetail(movieCard.id)
        }else if (event.target.className === 'likeBtn ion-ios-heart-outline'){
            event.target.className = 'likeBtn ion-ios-heart';
            event.target.id = movieCard.id;
            state.liked.push({
                value: movieCard,
                id: movieCard.id,
                })


        }else if (event.target.className === 'likeBtn ion-ios-heart'){
            event.target.className = 'likeBtn ion-ios-heart-outline' 
            
            const newLiked = state.liked.filter((item)=>String(item.id) !== event.target.id)
            .filter((item)=>`btn${item.id}` !== event.target.id)
            state.liked = newLiked

            renderView(state)
        }
    }
}

const loadMovieDetail = (id)=>{
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`)
    .then((resp)=>{
        return resp.json()
    }).then((data)=>{
        state.movieDetail = data
        state.modalOn = true
        renderView(state)
    })
}

const buildDetailModal = (detailData) =>{
    const modalWindow = document.createElement('div')
    modalWindow.className = 'modalContainer';
    modalWindow.innerHTML = ''
    const genres = detailData.genres.map((item)=>
    '<p class="genreIcon">' + item.name + '</p>'
    )
    const productionCompanies = detailData.production_companies
    .filter((item)=>{
        return item.logo_path
    }).map((item)=>
    '<img class="companyIcon" src="https://image.tmdb.org/t/p/original/' + item.logo_path + '"/>'
    )

    modalWindow.innerHTML = `
    <div class="detailModal">
        <img class="closeBtn" 
        onclick="closeModal()"
        src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-close-1024.png">
        <img class="modalPoster" src="https://image.tmdb.org/t/p/w500/${detailData.poster_path}"/>
        <div class="modalContent">
            <h2 class="modalMainTitle">${detailData.title}</h2>

            <h4 class="modalSecondaryTitle">Overview</h4>
            <p class="modalText">${detailData.overview}</p>
            
            <h4 class="modalSecondaryTitle">Genre</h4>
            <div class="genreContainer">
                ${genres}
            </div>

            <h4 class="modalSecondaryTitle">Rating</h4>
            <p class="modalText">${detailData.vote_average}</p>

            <h4 class="modalSecondaryTitle">Production Companies</h4>
            <div class="productionCompaniesContainer">
                ${productionCompanies}
            </div>
        </div>
    </div>
    `

    return modalWindow
}

const closeModal = ()=>{
    const modal = document.querySelector('.detailModal')
    if (modal){
        state.modalOn = false;
        renderView(state)
    }
}


const showPages = (state)=>{
    
    const pages = document.getElementById('pages');
    pages.innerHTML = '';
    pages.innerHTML = `
            <p>${state.page}/${state.totalPages}</p>
    `
    return pages
}

cardsContainer.addEventListener('click', handleCardsContainerClick)
homeBtn.addEventListener('click', ()=>{
    homeBtn.className = 'navBtn active'
    likedBtn.className = 'navBtn'
    state.likedPage = false;
    renderView(state)
})
likedBtn.addEventListener('click', ()=>{
    homeBtn.className = 'navBtn'
    likedBtn.className = 'navBtn active'
    state.likedPage = true;
    renderView(state)
})


loadMovieData()
