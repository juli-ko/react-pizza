import React from 'react';
import axios from 'axios';

import Categories from '../components/Categories';
import Sort from '../components/Sort';
import PizzaBlock from '../components/PizzaBlock';
import Skeleton from '../components/PizzaBlock/Skeleton';

function Home() {
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [categoryId, setCategoryId] = React.useState(0);
  const [activeSortOpt, setSortType] = React.useState({
    name: 'популярности',
    sortOpt: 'rating',
  });

  React.useEffect(() => {
    setIsLoading(true);

    const category = categoryId > 0 ? `category=${categoryId}&` : '';
    axios(
      `${process.env.REACT_APP_API_URL}/items?${category}_sort=${activeSortOpt.sortOpt}`
    ).then((arr) => {
      setItems(arr.data);
      setIsLoading(false);
    });
    window.scrollTo(0, 0);
  }, [categoryId, activeSortOpt]);

  return (
    <>
      <div className="content__top">
        <Categories
          categoryId={categoryId}
          onChangeCategory={(i) => setCategoryId(i)}
        />
        <Sort
          activeSortOpt={activeSortOpt}
          setSortType={(i) => setSortType(i)}
        />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">
        {isLoading
          ? [...new Array(6)].map((_, index) => <Skeleton key={index} />)
          : items.map((obj) => <PizzaBlock key={obj.id} {...obj} />)}
      </div>
    </>
  );
}

export default Home;
