import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("テキストを表示する", () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole("button", { name: "クリック" })).toBeInTheDocument();
  });

  it("onClick が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>送信</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("isLoading=true のときは disabled になり「送信中...」と表示", () => {
    render(<Button isLoading>送信</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(screen.getByText("送信中...")).toBeInTheDocument();
  });

  it("disabled のときクリックできない", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>送信</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("variant=secondary のクラスが適用される", () => {
    render(<Button variant="secondary">キャンセル</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");
  });
});
