import React from 'react';
import axios from 'axios';
import qs from 'qs';
import { useDispatch, useSelector } from 'react-redux';

import {
  setCategoryId,
  setCurrentPage,
  setFilters,
} from '../redux/slices/filterSlice';
import { SearchContext } from '../App';
import Categories from '../components/Categories';
import Sort, { sortOpts } from '../components/Sort';
import PizzaBlock from '../components/PizzaBlock';
import Skeleton from '../components/PizzaBlock/Skeleton';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSearchParamsChanged = React.useRef(false);
  const isMounted = React.useRef(false);

  const { categoryId, sort, currentPage } = useSelector(
    (state) => state.filter
  );
  const { searchValue } = React.useContext(SearchContext);
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchPizzas = () => {
    setIsLoading(true);

    const category = categoryId > 0 ? `category=${categoryId}&` : '';
    const search = searchValue ? `&search=${searchValue}` : '';
    axios
      .get(
        `https://67671610560fbd14f18cf5fd.mockapi.io/items?page=${currentPage}&limit=4&${category}&sortBy=${sort.sortOpt}${search}`
      )
      .then((arr) => {
        setItems(arr.data);
        setIsLoading(false);
      });
    console.log('now is fetching pizzas data');
  };

  //useEffect №0: только при перезагрузке страницы извлекаются параметры из URL (если они были) и сохраняются в Redux
  React.useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(window.location.search.substring(1));
      const sort = sortOpts.find((opt) => opt.sortOpt === params.sort);
      dispatch(setFilters({ ...params, sort }));
      isSearchParamsChanged.current = true;
      console.log('now page reload, search params are changed');
    }
  }, []);

  //useEffect №1: запрашиваем данные с сервера (если был перезапуск страницы, уже был useEffect №0 и параметры URL знаем)
  React.useEffect(() => {
    window.scrollTo(0, 0);

    if (!isSearchParamsChanged.current) {
      fetchPizzas();
    }
    isSearchParamsChanged.current = false;
  }, [categoryId, sort, searchValue, currentPage]);

  //useEffect №2: если компонент монтируется не впервые и меняются какие-то searchParams, меняем URL
  React.useEffect(() => {
    if (isMounted.current) {
      const queryString = qs.stringify({
        sort: sort.sortOpt,
        categoryId,
        currentPage,
      });

      navigate(`?${queryString}`);
      console.log('now actualize url');
    }
    isMounted.current = true;
    console.log('now is mounted');
  }, [categoryId, sort, searchValue, currentPage]);

  const skeletons = [...new Array(6)].map((_, index) => (
    <Skeleton key={index} />
  ));
  const pizzas = items.map((obj) => <PizzaBlock key={obj.id} {...obj} />);

  const onChangePage = (number) => {
    dispatch(setCurrentPage(number));
  };

  return (
    <>
      <div className="content__top">
        <Categories
          categoryId={categoryId}
          onChangeCategory={(id) => dispatch(setCategoryId(id))}
        />
        <Sort />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">{isLoading ? skeletons : pizzas}</div>
      <Pagination currentPage={currentPage} onChangePage={onChangePage} />
    </>
  );
}

export default Home;
