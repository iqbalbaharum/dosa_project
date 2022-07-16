// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Dosa2MintBurn is Ownable {
    using SafeMath for uint256;
    // address private constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private constant ROUTER = 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff;
    address private tokenA = 0xb2d15fe6f37B6E50D165Ec1EdD3de72308C99B6f; //DosaCoin

    // mapping (address => mapping (address => uint256)) private _allowances;
    IUniswapV2Router02 public immutable uniswapV2Router;
    uint public mintPrice = 0.01 ether;
    uint public tokenFee = 20;
    address public feeReceiver;
    bool inSwapAndLiquify;

    event SwapAndLiquify(uint256 tokensSwapped, uint256 ethReceived);
    event Mint(address to, uint amount);
    event Topup(address to, uint amount);
    event CashOut(address to, uint tokenId);
    
    // modifier lockTheSwap {
    //     inSwapAndLiquify = true;
    //     _;
    //     inSwapAndLiquify = false;
    // }

    constructor(address _feeReceiver) {
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(ROUTER);
        uniswapV2Router = _uniswapV2Router;

        feeReceiver = _feeReceiver;
    }

    receive() external payable {}

    function mint() public payable {
        require(msg.value >= mintPrice, "Amount not sufficient");
        // require(!inSwapAndLiquify, "Swap still in process");

        // uint256 tFee = calculateTaxFee(msg.value);
        // uint256 sFee = tFee.div(2);
        
        // (uint reserveA, uint reserveB) = getReserves(); 

        // uint _amount = getAmountOut(sFee, reserveB, reserveA);

        // swapAndLiquify(_amount, sFee);
        payable(feeReceiver).transfer(address(this).balance);

        emit Mint(msg.sender, msg.value);
    }

    function setFeeReceiver(address _feeReceiver) public onlyOwner {
        feeReceiver = _feeReceiver;
    }

    function swap() public payable {
        require(msg.value > 0, "Amount must not zero");

        (uint reserveToken, uint reserveEth) = getReserves(); 
        uint amountToken = getAmountOut(msg.value, reserveEth, reserveToken);

        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = tokenA;


        // make the swap
        uniswapV2Router.swapExactETHForTokens{value: msg.value}(
            amountToken,
            path,
            msg.sender,
            block.timestamp
        );

        // emit Topup(msg.sender, msg.value);
    }

    function topup(uint amount) public {
        require(amount > 0, "Amount must not zero");
        IERC20(tokenA).transferFrom(msg.sender, address(this), amount);

        uint256 tFee = calculateTokenFee(amount);
        uint256 amountToken = tFee.div(2);

        (uint reserveToken, uint reserveEth) = getReserves(); 

        uint ethAmount = getAmountOut(amountToken, reserveToken, reserveEth);

        // uint256 ethBalance = address(this).balance;
        // require(ethBalance >= ethAmount, "Balance not sufficient");

        swapAndLiquify(amountToken, ethAmount);

        emit Topup(msg.sender, amount);
    }

    function cashOut(uint tokenId) public {
      emit CashOut(msg.sender, tokenId);
    }

    function withdraw() public payable onlyOwner {
        // require(payable(msg.sender).send(address(this).balance));
        (bool result,)= payable(feeReceiver).call{value: address(this).balance }("");
        require(result, "Failure! Ether not sent");
    }

    function setMintPrice(uint _price) public onlyOwner {
        mintPrice = _price;
    }

    function setTokenFee(uint _fee) public onlyOwner {
        tokenFee = _fee;
    }

    function swapAndLiquify(uint256 amountToken, uint256 amountEth) private {
        // uint256 initialEthBalance = address(this).balance;

        swapTokensForEth(amountToken, amountEth);

        // uint256 newEthBalance = address(this).balance.sub(initialEthBalance);

        // add liquidity to uniswap
        addLiquidity(amountToken, amountEth);
        
        emit SwapAndLiquify(amountToken, amountEth);
    }

    function swapTokensForEth(uint256 tokenAmount, uint256 ethAmount) private {
        IERC20(tokenA).approve(ROUTER, tokenAmount);
        // generate the uniswap pair path of token -> weth
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = uniswapV2Router.WETH();

        // make the swap
        uniswapV2Router.swapExactTokensForETH(
            tokenAmount,
            ethAmount,
            path,
            address(this),
            block.timestamp
        );
    }

    function swapEthForTokens(uint256 tokenAmount, uint256 ethAmount) private {
        // generate the uniswap pair path of token -> weth
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = tokenA;


        // make the swap
        uniswapV2Router.swapExactETHForTokens{value: ethAmount}(
            tokenAmount,
            path,
            address(this),
            block.timestamp
        );
    }

    // function allowance(address owner, address spender) public view virtual returns (uint256) {
    //     return _allowances[owner][spender];
    // }

    // function approve(address spender, uint256 amount) public returns (bool) {
    //     _approve(_msgSender(), spender, amount);
    //     return true;
    // }

    // function _approve(address owner, address spender, uint256 amount) private {
    //     require(owner != address(0), "ERC20: approve from the zero address");
    //     require(spender != address(0), "ERC20: approve to the zero address");

    //     _allowances[owner][spender] = amount;
    //     emit Approval(owner, spender, amount);
    // }

    // function _spendAllowance(
    //     address owner,
    //     address spender,
    //     uint256 amount
    // ) internal virtual {
    //     uint256 currentAllowance = allowance(owner, spender);
    //     if (currentAllowance != type(uint256).max) {
    //         require(currentAllowance >= amount, "ERC20: insufficient allowance");
    //         unchecked {
    //             _approve(owner, spender, currentAllowance - amount);
    //         }
    //     }
    // }

    // function transfer(address to, uint256 amount) public virtual returns (bool) {
    //     address owner = _msgSender();
    //     _transfer(owner, to, amount);
    //     return true;
    // }

    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) public virtual returns (bool) {
    //     _spendAllowance(from, _msgSender(), amount);
    //     _transfer(from, to, amount);
    //     return true;
    // }

    // function _transfer(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) internal virtual {
    //     require(from != address(0), "ERC20: transfer from the zero address");
    //     require(to != address(0), "ERC20: transfer to the zero address");
    //     require(amount > 0, "Transfer amount must be greater than zero");

    //     emit Transfer(from, to, amount);

    // }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        // approve token transfer to cover all possible scenarios
        // _approve(address(this), address(uniswapV2Router), tokenAmount);
        IERC20(tokenA).approve(ROUTER, tokenAmount);
        // IERC20(uniswapV2Router.WETH()).approve(ROUTER, ethAmount);

        // add the liquidity
        uniswapV2Router.addLiquidityETH{value: ethAmount}(
            tokenA,
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            owner(),
            block.timestamp
        );
    }

    function calculateTokenFee(uint256 _amount) private view returns (uint256) {
        return _amount.mul(tokenFee).div(
            10**2
        );
    }

    function getReserves() public view returns (uint,  uint) {
        address _pairAddress = getPair();
        IUniswapV2Pair pair = IUniswapV2Pair(_pairAddress);
        (uint256 reserveA, uint256 reserveB,) = pair.getReserves();

        return (reserveA, reserveB);
    }

    function getPair() public view returns (address) {
        address pair = IUniswapV2Factory(uniswapV2Router.factory()).getPair(tokenA, uniswapV2Router.WETH());

        return pair;
    }

    function getAmountEthForToken(uint amountOut) public view returns (uint) {
        (uint reserveA, uint reserveB) = getReserves();

        return getAmountIn(amountOut, reserveB, reserveA);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(amountIn > 0, "UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "UniswapV2Library: INSUFFICIENT_LIQUIDITY");
        uint amountInWithFee = amountIn.mul(997);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn) {
        require(amountOut > 0, "UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        uint numerator = reserveIn.mul(amountOut).mul(1000);
        uint denominator = reserveOut.sub(amountOut).mul(997);
        amountIn = (numerator / denominator).add(1);
    }
}