function initPagination(items, currentPage, pageSize) {
    const totalItems = items ? items.length : 0;
    const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize);
    
    // if current page is out of bounds after filtering, reset to page 1
    if (currentPage > totalPages) {
      currentPage = 1;
    }
    
    return {
      totalItems,
      totalPages,
      currentPage
    };
  }
  
 
  function getPaginatedItems(items, currentPage, pageSize) {
    if (!items || items.length === 0) {
      return [];
    }
  
    // return all items if pageSize is -1 (Show all)
    if (pageSize === -1) {
      return items;
    }
  
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, items.length);
  
    return items.slice(startIndex, endIndex);
  }
  


function renderPagination({ 
  totalItems, 
  totalPages, 
  currentPage, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  containerId
}) {
  // store the position of the pagination container before we update it
  const container = document.querySelector(containerId);
  const paginationPosition = container ? container.querySelector('.pagination')?.getBoundingClientRect() : null;
  
  // clean up any existing pagination
  const existingPagination = document.querySelector(".pagination");
  if (existingPagination) {
    existingPagination.remove();
  }

  // create pagination container
  const pagination = document.createElement("div");
  pagination.className = "pagination";

  // create pagination info (showing X-Y of Z)
  const paginationInfo = document.createElement("div");
  paginationInfo.className = "pagination-info";

  // create buttons container for better responsive layout
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "pagination-buttons-container";

  // create previous button
  const prevButton = document.createElement("button");
  prevButton.className = "pagination-button";
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.title = "Previous page";

  if (currentPage === 1) {
    prevButton.classList.add("disabled");
  } else {
    prevButton.addEventListener("click", function () {
      if (currentPage > 1) {
        // create a wrapper function that maintains scroll position
        scrollPreservingPageChange(currentPage - 1);
      }
    });
  }

  // helper function to change page while preserving scroll position
  function scrollPreservingPageChange(newPage) {
    // record current position
    const paginationElement = document.querySelector('.pagination');
    const paginationRect = paginationElement?.getBoundingClientRect();
    
    // change the page (this will trigger a re-render)
    onPageChange(newPage);
    
    // after the DOM updates, restore the scroll position
    requestAnimationFrame(() => {
      const newPaginationElement = document.querySelector('.pagination');
      if (newPaginationElement && paginationRect) {
        // calculate the new scroll position to keep pagination in the same viewport position
        const newPaginationRect = newPaginationElement.getBoundingClientRect();
        const scrollAdjustment = newPaginationRect.top - paginationRect.top;
        window.scrollBy(0, scrollAdjustment);
      }
    });
  }

  // only add pagination buttons if we have multiple pages
  if (totalPages > 1) {
    // Add previous button
    buttonsContainer.appendChild(prevButton);

    // determine which 3 pages to show based on current page
    let startPage, endPage;
    
    if (currentPage === 1) {
      // if on first page, show pages 1, 2, 3
      startPage = 1;
      endPage = Math.min(3, totalPages);
    } else if (currentPage === totalPages) {
      // if on last page, show last 3 pages
      startPage = Math.max(1, totalPages - 2);
      endPage = totalPages;
    } else {
      // otherwise show current page with one before and one after
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    // generate page buttons for the 3 pages
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = "pagination-button pagination-page";
      pageButton.textContent = i;

      if (i === currentPage) {
        pageButton.classList.add("active");
      } else {
        pageButton.addEventListener("click", function () {
          scrollPreservingPageChange(i);
        });
      }

      buttonsContainer.appendChild(pageButton);
    }

    // create next button
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-button";
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.title = "Next page";

    if (currentPage === totalPages) {
      nextButton.classList.add("disabled");
    } else {
      nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
          scrollPreservingPageChange(currentPage + 1);
        }
      });
    }

    // add next button
    buttonsContainer.appendChild(nextButton);
  }

  // create the page size selector
  const pageSizeSelector = document.createElement("select");
  pageSizeSelector.id = "pageSizeSelector";
  
  // add options - 12, 24, 48 and All
  const pageSizeOptions = [
    { value: "12", text: "12 items per page" },
    { value: "24", text: "24 items per page" },
    { value: "48", text: "48 items per page" },
    { value: "-1", text: "Show all items" }
  ];
  
  pageSizeOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    pageSizeSelector.appendChild(optionElement);
  });
  
  // set current value
  pageSizeSelector.value = pageSize;

  // add event listener for page size change
  pageSizeSelector.addEventListener("change", function () {
    const newPageSize = parseInt(this.value);
    
    // save to localStorage
    localStorage.setItem("pageSize", newPageSize);
    
    // preserve scroll position when changing page size
    const paginationElement = document.querySelector('.pagination');
    const paginationRect = paginationElement?.getBoundingClientRect();
    
    // change the page size (this will trigger a re-render)
    onPageSizeChange(newPageSize);
    
    // after the DOM updates, restore the scroll position
    requestAnimationFrame(() => {
      const newPaginationElement = document.querySelector('.pagination');
      if (newPaginationElement && paginationRect) {
        // calculate the new scroll position
        const newPaginationRect = newPaginationElement.getBoundingClientRect();
        const scrollAdjustment = newPaginationRect.top - paginationRect.top;
        window.scrollBy(0, scrollAdjustment);
      }
    });
  });

  // for "Show all" option, just show the total count
  if (pageSize === -1) {
    paginationInfo.textContent = `Showing all ${totalItems} items`;
    
    // add pagination elements with correct order for "Show all"
    pagination.appendChild(paginationInfo);
    pagination.appendChild(pageSizeSelector);
  } else {
    // for normal pagination, calculate ranges
    const startIndex = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIndex = Math.min(currentPage * pageSize, totalItems);
    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalItems}`;

    // add components to pagination in the correct order
    if (totalPages > 1) {
      pagination.appendChild(buttonsContainer); // buttons first
    }
    pagination.appendChild(pageSizeSelector); // then select element
    pagination.appendChild(paginationInfo); // then pagination info
  }

  // add pagination to the container
  if (container) {
    container.appendChild(pagination);
    
    // if pagination before, maintain its position
    if (paginationPosition) {
      requestAnimationFrame(() => {
        const newPagination = document.querySelector('.pagination');
        if (newPagination) {
          const newPosition = newPagination.getBoundingClientRect();
          const scrollAdjustment = newPosition.top - paginationPosition.top;
          window.scrollBy(0, scrollAdjustment);
        }
      });
    }
  } else {
    console.error(`Pagination container with ID "${containerId}" not found`);
  }
}
  
  export {
    initPagination,
    getPaginatedItems,
    renderPagination
  };