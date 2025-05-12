import { useState } from 'react';
import { FormatCurrency, product, SearchIcon } from '../constants'
import { Link } from 'react-router-dom';

function Search() {
    const [query, setQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (!value.trim()) {
            setFilteredProducts([]);
            setShowPopup(false);
            return;
        }

        const lowerCaseQuery = value.toLowerCase();
        const filtered = product.filter((product) =>
            product.name.toLowerCase().includes(lowerCaseQuery)
        );

        setFilteredProducts(filtered);
        setShowPopup(filtered.length > 0);
    };

    const handleClosePopup = () => {
        setQuery("");
        setFilteredProducts([]);
        setShowPopup(false);
    };

    return (
        <div className=" flex relative w-full">
            <div className="container w-full flex justify-center align-center items-center ">
                <input type="text"
                    className="bg-tertiary py-2 px-2 w-[50%] placeholder:text-secondary text-black SearchIN outline-none border-none font-medium"
                    placeholder="Search Product..." value={query}
                    onChange={handleSearch} />
                <span className='bg-p2 py-2 px-5 SearchB'><SearchIcon /> </span>
            </div>
            {showPopup && (
                <div className="absolute max-w-md top-12  left-1/2 translate-x-[-50%] w-full bg-white shadow-lg rounded-md border border-gray-300 z-50">
                    <div className="flex justify-between items-center px-3 py-2 border-b">
                        <p className="text-sm text-gray-600">Search Results</p>
                        <button
                            onClick={handleClosePopup}
                            className="text-red-500 text-xs font-semibold"
                        >
                            ✕ Close
                        </button>
                    </div>
                    <ul>
                        {filteredProducts.map((product) => (
                            <li key={product.id} className="p-2 hover:bg-gray-100">
                                <Link
                                    to={`/product/${product.id}`}
                                    className="flex items-center gap-3"
                                    onClick={handleClosePopup}
                                >
                                    <img
                                        src={product.cover}
                                        alt={product.name}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                    <div>
                                        <p className="text-sm text-blue-300 font-semibold">{product.name}</p>
                                        <p className="text-xs text-gray-500">{FormatCurrency(product.price)}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Search

