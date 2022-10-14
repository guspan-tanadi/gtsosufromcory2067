import React, { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import UserCard from "../modules/UserCard";
import { get, hasAccess, delet, post } from "../../utilities";
import "./Donate.css";

import { Layout, Form, Button, Collapse, Input, Progress } from "antd";
import { UserAuth } from "../../permissions/UserAuth";
import { UserRole } from "../../permissions/UserRole";
const { Content } = Layout;
const { Panel } = Collapse;

const DONATION_GOAL = 1800;

function Donate({ user }) {
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);
  const auth = new UserAuth(user).forGlobal();

  useEffect(() => {
    get("/api/donors", {}).then((res) => {
      setDonors(res);
    });
  }, []);

  const submitDonation = async (form) => {
    const newUser = await post("/api/manual-donation", form);
    setDonors(
      donors
        .filter((donor) => donor._id !== newUser._id)
        .concat(newUser)
        .sort((a, b) => b.donations - a.donations)
    );
  };

  const total = useMemo(() => {
    return donors.reduce((prev, cur) => prev + cur.donations, 0).toFixed(2);
  }, [donors]);

  return (
    <Content className="content">
      {auth.hasRole(UserRole.Admin) && (
        <Collapse style={{ marginBottom: 16 }}>
          <Panel header="Submit donation manually" key="1">
            <Form name="basic" onFinish={submitDonation}>
              <Form.Item label="Username" name="username">
                <Input />
              </Form.Item>
              <Form.Item label="Donation Amount" name="donation">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>
      )}
      <div className="Donate-progress">
        Donation Goal: ${total} / ${DONATION_GOAL}
        <Progress
          strokeWidth={24}
          strokeColor={"#f75c03"} // gts-orange
          trailColor={"#131415"} // darker-night
          percent={Math.round((total / DONATION_GOAL) * 100)}
        />
      </div>
      <div className="Donate-wrapper">
        <iframe
          className="Donate-iframe"
          src="https://ko-fi.com/globaltaikoshowdown/?hidefeed=true&widget=true&embed=true&preview=tru"
        ></iframe>
        <div className="Donate-info">
          <h1>Support GTS!</h1>
          <p>
            In 2021, we offered a total of $1,800 in cash prizes to the winners of GTS tournaments.
            But due to a sponsorship scam, we ended up never getting that funding. We need your help
            to give our GTS champions the prizes they've earned!
          </p>
          <p>
            Everyone on the GTS team has worked for free, through their own generosity and passion
            for the series. This includes designers, who make custom art and videos for every
            tournament, and composers, who make our many custom songs. Your donation can help us
            reward these team members for their tireless efforts.
          </p>
          <p>Thank you for supporting GTS!</p>
          <h2>Supporter Benefits</h2>
          <p>Make sure to use your osu! username when donating to get these benefits.</p>
          <p>
            <ul>
              <li>
                <strong>$5</strong> - Supporter badge next to your name on the GTS website
              </li>
              <li>
                <strong>Coming soon</strong> - Custom designs for your player card on the GTS
                website!
              </li>
            </ul>
          </p>
        </div>
      </div>
      <div className="Donate-leaderboard">
        <h1>Top Supporters</h1>
        <div className="Donate-leaderboard-inner">
          {donors.map((user, i) => (
            <UserCard
              key={user.userid}
              user={{ ...user, rank: i + 1 }}
              extra={`Donated $${user.donations.toFixed(2)}`}
            />
          ))}
        </div>
      </div>
    </Content>
  );
}

export default Donate;
